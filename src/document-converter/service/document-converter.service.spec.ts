import { DocumentConverterService } from './document-converter.service';
import { HwpWebpConverterService } from './hwp-webp-converter.service';
import { PdfWebpConverterService } from './pdf-webp-converter.service';
import { WebpPages } from './webp-types';

/**
 * 스펙:
 * 1) .hwp/.hwpx 는 HWP 변환기, .pdf 는 PDF 변환기로 간다 (확장자 대소문자 무시)
 * 2) 결과에 originalName · kind · scale · quality · elapsedMs 가 붙는다
 * 3) 지원하지 않는 확장자 → 400 DOC-CONVERT-002
 * 4) 빈 파일 → 400 DOC-CONVERT-002
 * 5) scale 은 1~maxScale 로, quality 는 1~100 로 잘리고 기본값은 2 · 80
 */
const pages: WebpPages = { pageCount: 1, pages: [{ page: 1, width: 10, height: 10, bytes: 1, data: Buffer.from('x') }] };

function build() {
  const hwpCalls: unknown[] = [];
  const pdfCalls: unknown[] = [];
  const hwp = { convert: async (_b: Buffer, o: unknown) => (hwpCalls.push(o), pages) } as unknown as HwpWebpConverterService;
  const pdf = { convert: async (_b: Buffer, o: unknown) => (pdfCalls.push(o), pages) } as unknown as PdfWebpConverterService;
  return { service: new DocumentConverterService(hwp, pdf), hwpCalls, pdfCalls };
}

describe('DocumentConverterService', () => {
  it('.HWP 는 HWP 변환기로, 결과에 kind=hwp', async () => {
    const { service, hwpCalls, pdfCalls } = build();
    const r = await service.convertToWebp(Buffer.from('a'), 'notice.HWP', {});
    expect(hwpCalls).toHaveLength(1);
    expect(pdfCalls).toHaveLength(0);
    expect(r.kind).toBe('hwp');
    expect(r.originalName).toBe('notice.HWP');
    expect(r.pageCount).toBe(1);
    expect(typeof r.elapsedMs).toBe('number');
  });

  it('.pdf 는 PDF 변환기로, kind=pdf', async () => {
    const { service, pdfCalls } = build();
    const r = await service.convertToWebp(Buffer.from('a'), 'a.pdf', {});
    expect(pdfCalls).toHaveLength(1);
    expect(r.kind).toBe('pdf');
  });

  it('기본 옵션은 scale 2 · quality 80', async () => {
    const { service, hwpCalls } = build();
    const r = await service.convertToWebp(Buffer.from('a'), 'a.hwpx', {});
    expect(hwpCalls[0]).toEqual({ scale: 2, quality: 80 });
    expect(r.scale).toBe(2);
    expect(r.quality).toBe(80);
  });

  it('scale 은 1~4, quality 는 1~100 으로 자른다', async () => {
    const { service, hwpCalls } = build();
    await service.convertToWebp(Buffer.from('a'), 'a.hwp', { scale: 9, quality: 150 });
    await service.convertToWebp(Buffer.from('a'), 'a.hwp', { scale: 0.2, quality: 0 });
    expect(hwpCalls[0]).toEqual({ scale: 4, quality: 100 });
    expect(hwpCalls[1]).toEqual({ scale: 1, quality: 1 });
  });

  it('지원하지 않는 확장자는 400 DOC-CONVERT-002', async () => {
    const { service } = build();
    await expect(service.convertToWebp(Buffer.from('a'), 'a.docx', {})).rejects.toMatchObject({ status: 400, response: { code: 'DOC-CONVERT-002' } });
    await expect(service.convertToWebp(Buffer.from('a'), 'noext', {})).rejects.toMatchObject({ status: 400, response: { code: 'DOC-CONVERT-002' } });
  });

  it('빈 파일은 400 DOC-CONVERT-002', async () => {
    const { service } = build();
    await expect(service.convertToWebp(Buffer.alloc(0), 'a.hwp', {})).rejects.toMatchObject({ status: 400, response: { code: 'DOC-CONVERT-002' } });
  });
});
