import * as fs from 'fs';
import * as path from 'path';
import * as Sharp from 'sharp';
import { ExecFn, PdfWebpConverterService } from './pdf-webp-converter.service';

/**
 * 스펙 (poppler 는 가짜 exec 로 대체):
 * 1) pdfinfo 가 3 페이지라 하고 pdftoppm 이 page-1/2/10.png 를 쓰면 → 자연 정렬된 3 페이지 WebP
 * 2) pdftoppm 에 -r 96*scale 이 넘어간다 (scale=2 → 192)
 * 3) pdfinfo 페이지 수가 maxPages 초과 → 400 DOC-CONVERT-003, pdftoppm 은 호출되지 않음
 * 4) 실행 파일이 없으면(ENOENT) → 503 DOC-CONVERT-005
 * 5) 시간 초과(killed) → 504 DOC-CONVERT-007
 * 6) 그 외 실패 → 400 DOC-CONVERT-004 (stderr 포함)
 * 7) 임시 폴더는 끝나면 지워진다
 */
async function png(width: number, height: number): Promise<Buffer> {
  return Sharp({ create: { width, height, channels: 3, background: '#fff' } })
    .png()
    .toBuffer();
}

function fakeExec(opts: { pages?: number; files?: Record<string, [number, number]>; fail?: Error & { code?: string; killed?: boolean; stderr?: string } }) {
  const calls: { file: string; args: string[] }[] = [];
  const tempDirs: string[] = [];
  const exec: ExecFn = async (file, args) => {
    calls.push({ file, args });
    if (opts.fail) throw opts.fail;
    if (file.includes('pdfinfo')) return { stdout: `Title:  x\nPages:          ${opts.pages ?? 1}\nPage size: 595 x 842 pts\n`, stderr: '' };
    const prefix = args[args.length - 1];
    tempDirs.push(path.dirname(prefix));
    for (const [name, [w, h]] of Object.entries(opts.files ?? {})) {
      fs.writeFileSync(`${prefix}${name}`, await png(w, h));
    }
    return { stdout: '', stderr: 'Syntax Warning: something' };
  };
  return { exec, calls, tempDirs };
}

const config = { maxPages: 100, encodeConcurrency: 2, pdftoppmPath: 'pdftoppm', pdfinfoPath: 'pdfinfo', pdfTimeoutMs: 1000 };

describe('PdfWebpConverterService', () => {
  it('페이지를 자연 정렬해서 WebP 로 돌려준다', async () => {
    const { exec, calls, tempDirs } = fakeExec({ pages: 3, files: { '-1.png': [100, 50], '-2.png': [100, 50], '-10.png': [120, 60] } });
    const service = new PdfWebpConverterService(exec, config);
    const result = await service.convert(Buffer.from('%PDF-1.4'), { scale: 2, quality: 80 });

    expect(result.pageCount).toBe(3);
    expect(result.pages.map(p => p.page)).toEqual([1, 2, 3]);
    expect(result.pages[2].width).toBe(120);
    expect(result.pages[2].height).toBe(60);
    expect(result.pages[0].data.subarray(8, 12).toString('ascii')).toBe('WEBP');
    expect(result.pages[0].bytes).toBe(result.pages[0].data.length);

    const toppm = calls.find(c => c.file === 'pdftoppm')!;
    expect(toppm.args.slice(0, 3)).toEqual(['-png', '-r', '192']);
    expect(fs.existsSync(tempDirs[0])).toBe(false);
  });

  it('pdfinfo 페이지 수가 maxPages 를 넘으면 400 DOC-CONVERT-003 이고 pdftoppm 은 부르지 않는다', async () => {
    const { exec, calls } = fakeExec({ pages: 101 });
    const service = new PdfWebpConverterService(exec, config);
    await expect(service.convert(Buffer.from('%PDF-1.4'), { scale: 1, quality: 80 })).rejects.toMatchObject({
      status: 400,
      response: { code: 'DOC-CONVERT-003', detail: { pageCount: 101, maxPages: 100 } },
    });
    expect(calls.map(c => c.file)).toEqual(['pdfinfo']);
  });

  it('poppler 가 없으면 503 DOC-CONVERT-005', async () => {
    const { exec } = fakeExec({ fail: Object.assign(new Error('spawn pdfinfo ENOENT'), { code: 'ENOENT' }) });
    const service = new PdfWebpConverterService(exec, config);
    await expect(service.convert(Buffer.from('%PDF-1.4'), { scale: 1, quality: 80 })).rejects.toMatchObject({
      status: 503,
      response: { code: 'DOC-CONVERT-005' },
    });
  });

  it('시간 초과면 504 DOC-CONVERT-007', async () => {
    const { exec } = fakeExec({ fail: Object.assign(new Error('killed'), { killed: true }) });
    const service = new PdfWebpConverterService(exec, config);
    await expect(service.convert(Buffer.from('%PDF-1.4'), { scale: 1, quality: 80 })).rejects.toMatchObject({
      status: 504,
      response: { code: 'DOC-CONVERT-007' },
    });
  });

  it('렌더링 실패면 400 DOC-CONVERT-004 와 stderr', async () => {
    const { exec } = fakeExec({ fail: Object.assign(new Error('Command failed'), { stderr: "Syntax Error: Couldn't read xref table" }) });
    const service = new PdfWebpConverterService(exec, config);
    await expect(service.convert(Buffer.from('zzz'), { scale: 1, quality: 80 })).rejects.toMatchObject({
      status: 400,
      response: { code: 'DOC-CONVERT-004', detail: { stderr: "Syntax Error: Couldn't read xref table" } },
    });
  });

  it('pdftoppm 이 파일을 하나도 안 만들면 400 DOC-CONVERT-004', async () => {
    const { exec } = fakeExec({ pages: 1, files: {} });
    const service = new PdfWebpConverterService(exec, config);
    await expect(service.convert(Buffer.from('%PDF-1.4'), { scale: 1, quality: 80 })).rejects.toMatchObject({
      status: 400,
      response: { code: 'DOC-CONVERT-004' },
    });
  });
});
