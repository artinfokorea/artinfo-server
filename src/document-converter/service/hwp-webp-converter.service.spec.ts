import { HwpWebpConverterService } from './hwp-webp-converter.service';
import { HwpPageRenderer, HwpRendererFactory } from './hwp-renderer';

/**
 * 스펙 (렌더러는 가짜 — rhwp WASM 은 실서버에서만 로드):
 * 1) 2 페이지 문서 → WebP 2장, scale=2 면 100x50 SVG 가 200x100 픽셀
 * 2) 페이지 데이터는 RIFF/WEBP 헤더로 시작하고 bytes 가 길이와 같다
 * 3) 변환이 끝나면(성공·실패 모두) 문서를 free 한다
 * 4) 페이지 수가 maxPages 를 넘으면 400 DOC-CONVERT-003
 * 5) 파일을 열지 못하면 400 DOC-CONVERT-004
 * 6) 페이지가 0 이면 400 DOC-CONVERT-004
 */
const svg = (w: number, h: number) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><rect width="${w}" height="${h}" fill="#fff"/><rect x="10" y="10" width="30" height="20" fill="#f00"/></svg>`;

function fakeFactory(pages: string[], opts: { openError?: Error } = {}) {
  const freed: boolean[] = [];
  const factory: HwpRendererFactory = {
    open: async (): Promise<HwpPageRenderer> => {
      if (opts.openError) throw opts.openError;
      return {
        pageCount: () => pages.length,
        renderPageSvg: (i: number) => pages[i],
        free: () => {
          freed.push(true);
        },
      };
    },
    doctor: async () => ({ ok: true, version: 'fake' }),
  };
  return { factory, freed };
}

describe('HwpWebpConverterService', () => {
  it('2 페이지 문서를 scale=2 로 변환하면 200x100 WebP 2장이 나온다', async () => {
    const { factory, freed } = fakeFactory([svg(100, 50), svg(100, 50)]);
    const service = new HwpWebpConverterService(factory, { maxPages: 100, encodeConcurrency: 2 });
    const result = await service.convert(Buffer.from('hwp'), { scale: 2, quality: 80 });

    expect(result.pageCount).toBe(2);
    expect(result.pages.map(p => p.page)).toEqual([1, 2]);
    expect(result.pages[0].width).toBe(200);
    expect(result.pages[0].height).toBe(100);
    expect(result.pages[1].data.subarray(0, 4).toString('ascii')).toBe('RIFF');
    expect(result.pages[1].data.subarray(8, 12).toString('ascii')).toBe('WEBP');
    expect(result.pages[1].bytes).toBe(result.pages[1].data.length);
    expect(freed).toEqual([true]);
  });

  it('scale=1 이면 원본 크기(100x50) 그대로', async () => {
    const { factory } = fakeFactory([svg(100, 50)]);
    const service = new HwpWebpConverterService(factory, { maxPages: 100, encodeConcurrency: 2 });
    const result = await service.convert(Buffer.from('hwp'), { scale: 1, quality: 80 });
    expect(result.pages[0].width).toBe(100);
    expect(result.pages[0].height).toBe(50);
  });

  it('페이지 수가 maxPages 를 넘으면 400 DOC-CONVERT-003 이고 문서를 free 한다', async () => {
    const { factory, freed } = fakeFactory([svg(10, 10), svg(10, 10), svg(10, 10)]);
    const service = new HwpWebpConverterService(factory, { maxPages: 2, encodeConcurrency: 2 });
    await expect(service.convert(Buffer.from('hwp'), { scale: 1, quality: 80 })).rejects.toMatchObject({
      status: 400,
      response: { code: 'DOC-CONVERT-003', detail: { pageCount: 3, maxPages: 2 } },
    });
    expect(freed).toEqual([true]);
  });

  it('파일을 열지 못하면 400 DOC-CONVERT-004', async () => {
    const { factory } = fakeFactory([], { openError: new Error('invalid HWP signature') });
    const service = new HwpWebpConverterService(factory, { maxPages: 100, encodeConcurrency: 2 });
    await expect(service.convert(Buffer.from('zzz'), { scale: 1, quality: 80 })).rejects.toMatchObject({
      status: 400,
      response: { code: 'DOC-CONVERT-004', detail: { reason: 'invalid HWP signature' } },
    });
  });

  it('페이지가 0 이면 400 DOC-CONVERT-004', async () => {
    const { factory, freed } = fakeFactory([]);
    const service = new HwpWebpConverterService(factory, { maxPages: 100, encodeConcurrency: 2 });
    await expect(service.convert(Buffer.from('hwp'), { scale: 1, quality: 80 })).rejects.toMatchObject({ status: 400, response: { code: 'DOC-CONVERT-004' } });
    expect(freed).toEqual([true]);
  });
});
