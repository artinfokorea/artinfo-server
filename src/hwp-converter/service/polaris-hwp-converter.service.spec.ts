import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { HttpException } from '@nestjs/common';
import { PolarisHwpConverterService } from './polaris-hwp-converter.service';
import { HwpConverterDriver } from './polaris-driver';

/**
 * 스펙 (실측 기반 기대값):
 * 1) .hwp/.hwpx/.hwt/.hwtx 외 확장자 → 400 HWP-CONVERT-002
 * 2) 빈 파일 → 400 HWP-CONVERT-002
 * 3) macOS 가 아니면 → 503 HWP-CONVERT-001 (드라이버를 호출하지 않는다)
 * 4) 드라이버가 돌려준 PNG 들을 파일명 자연 정렬(…_0002 가 …_0010 앞)로 1부터 페이지 번호를 매기고 가로·세로를 읽는다
 * 5) 성공·실패와 무관하게 문서를 닫고 작업 폴더를 지운다
 */
function pngOf(width: number, height: number): Buffer {
  const buf = Buffer.alloc(33);
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]).copy(buf, 0);
  buf.writeUInt32BE(13, 8);
  buf.write('IHDR', 12, 'ascii');
  buf.writeUInt32BE(width, 16);
  buf.writeUInt32BE(height, 20);
  return buf;
}

class FakeDriver implements HwpConverterDriver {
  opened: string[] = [];
  closed = 0;
  constructor(private readonly pageNames: string[]) {}
  async openDocument(filePath: string): Promise<string[]> {
    this.opened.push(filePath);
    return [];
  }
  async exportPng(): Promise<{ steps: string[] }> {
    return { steps: ['fake_export'] };
  }
  async waitForPngs(searchDir: string): Promise<string[]> {
    const dir = path.join(searchDir, 'out.png');
    fs.mkdirSync(dir, { recursive: true });
    const files = this.pageNames.map((n, i) => {
      const p = path.join(dir, n);
      fs.writeFileSync(p, pngOf(793, 1122 + i));
      return p;
    });
    return files;
  }
  async closeDocument(): Promise<string> {
    this.closed += 1;
    return 'DONE';
  }
  async dumpUi(): Promise<string> {
    return '';
  }
}

describe('PolarisHwpConverterService', () => {
  const workDir = fs.mkdtempSync(path.join(os.tmpdir(), 'hwp-converter-spec-'));
  const darwin = { platform: 'darwin' as NodeJS.Platform, workDir, cleanup: true };

  it('hwp 계열이 아닌 확장자는 400 HWP-CONVERT-002', async () => {
    const service = new PolarisHwpConverterService(new FakeDriver([]), darwin);
    await expect(service.convertToPng(Buffer.from('x'), 'file.docx')).rejects.toMatchObject({
      status: 400,
      response: { code: 'HWP-CONVERT-002' },
    });
  });

  it('빈 파일은 400 HWP-CONVERT-002', async () => {
    const service = new PolarisHwpConverterService(new FakeDriver([]), darwin);
    await expect(service.convertToPng(Buffer.alloc(0), 'file.hwp')).rejects.toMatchObject({ status: 400 });
  });

  it('macOS 가 아니면 503 HWP-CONVERT-001 이고 드라이버를 호출하지 않는다', async () => {
    const driver = new FakeDriver(['a_0001.png']);
    const service = new PolarisHwpConverterService(driver, { ...darwin, platform: 'linux' });
    const err = await service.convertToPng(Buffer.from('x'), 'file.hwp').catch(e => e);
    expect(err).toBeInstanceOf(HttpException);
    expect(err.getStatus()).toBe(503);
    expect(err.getResponse()).toMatchObject({ code: 'HWP-CONVERT-001' });
    expect(driver.opened).toEqual([]);
  });

  it('PNG 를 자연 정렬해 1부터 페이지를 매기고 크기를 읽으며, 문서를 닫고 작업 폴더를 지운다', async () => {
    const driver = new FakeDriver(['doc_0010.png', 'doc_0002.png', 'doc_0001.png']);
    const service = new PolarisHwpConverterService(driver, darwin);
    const result = await service.convertToPng(Buffer.from('hwp-bytes'), '공고.hwp');

    expect(result.pageCount).toBe(3);
    expect(result.pages.map(p => [p.page, p.fileName, p.width, p.height])).toEqual([
      [1, 'doc_0001.png', 793, 1124],
      [2, 'doc_0002.png', 793, 1123],
      [3, 'doc_0010.png', 793, 1122],
    ]);
    expect(result.originalName).toBe('공고.hwp');
    expect(result.steps).toEqual(['document_opened', 'fake_export']);
    expect(driver.opened).toHaveLength(1);
    expect(driver.opened[0].endsWith('.hwp')).toBe(true);
    expect(driver.closed).toBe(1);
    expect(fs.readdirSync(workDir)).toEqual([]);
  });

  it('드라이버가 실패해도 문서를 닫고 작업 폴더를 지운 뒤 500 HWP-CONVERT-003 을 던진다', async () => {
    const driver = new FakeDriver([]);
    driver.exportPng = async () => {
      throw new Error('ui broke');
    };
    const service = new PolarisHwpConverterService(driver, darwin);
    await expect(service.convertToPng(Buffer.from('x'), 'file.hwpx')).rejects.toMatchObject({
      status: 500,
      response: { code: 'HWP-CONVERT-003' },
    });
    expect(driver.closed).toBe(1);
    expect(fs.readdirSync(workDir)).toEqual([]);
  });
});
