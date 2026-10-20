import { Response } from 'express';
import { DocumentConverterController } from './document-converter.controller';
import { DocumentConverterService } from '../service/document-converter.service';

/**
 * 스펙:
 * 1) 파일이 없으면 400 DOC-CONVERT-001
 * 2) format 기본(json) → 공통 봉투 { code:'OK', item } 에 페이지마다 base64 와 크기
 * 3) format=webp&page=N → image/webp 바이너리, X-Page-Count 헤더
 * 4) format=webp 인데 없는 페이지 → 404 DOC-CONVERT-006
 * 5) scale · quality 쿼리가 서비스로 전달된다
 */
const webp = Buffer.from('RIFF\u0000\u0000\u0000\u0000WEBPVP8 ', 'binary');

function fakeService() {
  const calls: unknown[] = [];
  const service = {
    convertToWebp: async (_buf: Buffer, originalName: string, options: unknown) => {
      calls.push(options);
      return {
        originalName,
        kind: 'hwp' as const,
        pageCount: 2,
        scale: 2,
        quality: 80,
        elapsedMs: 10,
        pages: [1, 2].map(n => ({ page: n, width: 10, height: 20, bytes: webp.length, data: webp })),
      };
    },
  } as unknown as DocumentConverterService;
  return { service, calls };
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

describe('DocumentConverterController', () => {
  const file = { buffer: Buffer.from('hwp'), originalname: 'a.hwp', mimetype: 'application/octet-stream', size: 3 };

  it('파일이 없으면 400 DOC-CONVERT-001', async () => {
    const controller = new DocumentConverterController(fakeService().service);
    await expect(controller.convertToWebp([], {}, fakeRes())).rejects.toMatchObject({ status: 400, response: { code: 'DOC-CONVERT-001' } });
  });

  it('json 형식은 공통 봉투에 페이지마다 base64 를 담는다', async () => {
    const { service, calls } = fakeService();
    const controller = new DocumentConverterController(service);
    const res = fakeRes();
    await controller.convertToWebp([file], { scale: 3, quality: 50 }, res);

    expect(calls[0]).toEqual({ scale: 3, quality: 50 });
    expect(res.json).toHaveBeenCalledTimes(1);
    const body = res.json.mock.calls[0][0];
    expect(body.code).toBe('OK');
    expect(body.item.pageCount).toBe(2);
    expect(body.item.kind).toBe('hwp');
    expect(body.item.pages[1].page).toBe(2);
    expect(body.item.pages[1].mimeType).toBe('image/webp');
    expect(body.item.pages[1].width).toBe(10);
    expect(Buffer.from(body.item.pages[1].data, 'base64').equals(webp)).toBe(true);
    expect(res.send).not.toHaveBeenCalled();
  });

  it('format=webp&page=2 는 WebP 바이너리와 X-Page-Count 헤더를 보낸다', async () => {
    const controller = new DocumentConverterController(fakeService().service);
    const res = fakeRes();
    await controller.convertToWebp([file], { format: 'webp', page: 2 }, res);
    expect(res.headers['Content-Type']).toBe('image/webp');
    expect(res.headers['X-Page-Count']).toBe('2');
    expect(res.send).toHaveBeenCalledWith(webp);
    expect(res.json).not.toHaveBeenCalled();
  });

  it('format=webp 인데 없는 페이지면 404 DOC-CONVERT-006', async () => {
    const controller = new DocumentConverterController(fakeService().service);
    await expect(controller.convertToWebp([file], { format: 'webp', page: 9 }, fakeRes())).rejects.toMatchObject({
      status: 404,
      response: { code: 'DOC-CONVERT-006' },
    });
  });
});
