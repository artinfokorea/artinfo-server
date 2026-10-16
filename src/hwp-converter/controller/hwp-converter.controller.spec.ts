import { Response } from 'express';
import { HwpConverterController } from './hwp-converter.controller';
import { PolarisHwpConverterService } from '../service/polaris-hwp-converter.service';

/**
 * 스펙:
 * 1) 파일이 없으면 400 HWP-CONVERT-004
 * 2) format 기본(json) → 페이지마다 base64 data 와 크기
 * 3) format=png&page=N → PNG 바이너리, X-Page-Count 헤더
 * 4) format=png 인데 없는 페이지 → 404 HWP-CONVERT-005
 */
const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');

function fakeService(): PolarisHwpConverterService {
  return {
    convertToPng: async (_buf: Buffer, originalName: string) => ({
      jobId: 'job1',
      originalName,
      pageCount: 2,
      elapsedMs: 10,
      steps: ['document_opened'],
      pages: [1, 2].map(n => ({ page: n, fileName: `p_000${n}.png`, width: 1, height: 1, bytes: png.length, data: png })),
    }),
  } as unknown as PolarisHwpConverterService;
}

function fakeRes() {
  const headers: Record<string, string> = {};
  const res = {
    setHeader: (k: string, v: string) => {
      headers[k] = v;
    },
    status: jest.fn().mockReturnThis(),
    send: jest.fn(),
    json: jest.fn(),
    headers,
  };
  return res as unknown as Response & { headers: Record<string, string>; send: jest.Mock; json: jest.Mock };
}

describe('HwpConverterController', () => {
  const file = { buffer: Buffer.from('hwp'), originalname: 'a.hwp', mimetype: 'application/octet-stream', size: 3 };

  it('파일이 없으면 400 HWP-CONVERT-004', async () => {
    const controller = new HwpConverterController(fakeService());
    await expect(controller.convertToPng([], {}, fakeRes())).rejects.toMatchObject({ status: 400, response: { code: 'HWP-CONVERT-004' } });
  });

  it('json 형식은 페이지마다 base64 를 담는다', async () => {
    const controller = new HwpConverterController(fakeService());
    const res = fakeRes();
    const body = await controller.convertToPng([file], {}, res);
    expect(body).toBeDefined();
    expect(body!.pageCount).toBe(2);
    expect(body!.pages[1].page).toBe(2);
    expect(body!.pages[1].mimeType).toBe('image/png');
    expect(Buffer.from(body!.pages[1].data, 'base64').equals(png)).toBe(true);
    expect(res.send).not.toHaveBeenCalled();
  });

  it('format=png&page=2 는 PNG 바이너리와 X-Page-Count 헤더를 보낸다', async () => {
    const controller = new HwpConverterController(fakeService());
    const res = fakeRes();
    const body = await controller.convertToPng([file], { format: 'png', page: 2 }, res);
    expect(body).toBeUndefined();
    expect(res.headers['Content-Type']).toBe('image/png');
    expect(res.headers['X-Page-Count']).toBe('2');
    expect(res.send).toHaveBeenCalledWith(png);
  });

  it('format=png 인데 없는 페이지면 404 HWP-CONVERT-005', async () => {
    const controller = new HwpConverterController(fakeService());
    await expect(controller.convertToPng([file], { format: 'png', page: 9 }, fakeRes())).rejects.toMatchObject({
      status: 404,
      response: { code: 'HWP-CONVERT-005' },
    });
  });
});
