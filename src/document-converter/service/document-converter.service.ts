import { Injectable } from '@nestjs/common';
import * as path from 'path';
import { HWP_EXTENSIONS, PDF_EXTENSIONS, documentConverterConfig } from '../document-converter.config';
import { DocumentUnsupportedFile } from '../exception/document-converter.exception';
import { HwpWebpConverterService } from './hwp-webp-converter.service';
import { PdfWebpConverterService } from './pdf-webp-converter.service';
import { DocumentKind, WebpConvertOptions, WebpConvertResult } from './webp-types';

export interface DocumentConverterDoctor {
  ok: boolean;
  hwp: { ok: boolean; version?: string; error?: string };
  pdf: { ok: boolean; pdftoppm: string; pdfinfo: string; version?: string; error?: string };
  maxPages: number;
  supportedExtensions: string[];
}

/** 확장자로 HWP · PDF 변환기를 고르고, 옵션 기본값·범위를 정리한다. */
@Injectable()
export class DocumentConverterService {
  constructor(
    private readonly hwpConverter: HwpWebpConverterService,
    private readonly pdfConverter: PdfWebpConverterService,
  ) {}

  async convertToWebp(buffer: Buffer, originalName: string, options: Partial<WebpConvertOptions>): Promise<WebpConvertResult> {
    const kind = this.kindOf(originalName);
    if (buffer.length === 0) throw new DocumentUnsupportedFile('빈 파일입니다.');

    const normalized = this.normalize(options);
    const startedAt = Date.now();
    const converter = kind === 'hwp' ? this.hwpConverter : this.pdfConverter;
    const pages = await converter.convert(buffer, normalized);

    return { originalName, kind, ...normalized, ...pages, elapsedMs: Date.now() - startedAt };
  }

  async doctor(): Promise<DocumentConverterDoctor> {
    const [hwp, pdf] = await Promise.all([this.hwpConverter.doctor(), this.pdfConverter.doctor()]);
    return {
      ok: hwp.ok && pdf.ok,
      hwp,
      pdf,
      maxPages: documentConverterConfig.maxPages,
      supportedExtensions: [...HWP_EXTENSIONS, ...PDF_EXTENSIONS],
    };
  }

  private kindOf(originalName: string): DocumentKind {
    const ext = path.extname(originalName).toLowerCase();
    if (HWP_EXTENSIONS.has(ext)) return 'hwp';
    if (PDF_EXTENSIONS.has(ext)) return 'pdf';
    throw new DocumentUnsupportedFile(`지원하지 않는 확장자입니다: ${ext || '(없음)'} — ${[...HWP_EXTENSIONS, ...PDF_EXTENSIONS].join(', ')} 만 가능`);
  }

  private normalize(options: Partial<WebpConvertOptions>): WebpConvertOptions {
    const clamp = (v: number | undefined, min: number, max: number, fallback: number) => {
      if (v === undefined || v === null || Number.isNaN(Number(v))) return fallback;
      return Math.min(max, Math.max(min, Number(v)));
    };
    return {
      scale: clamp(options.scale, 1, documentConverterConfig.maxScale, documentConverterConfig.defaultScale),
      quality: Math.round(clamp(options.quality, 1, 100, documentConverterConfig.defaultQuality)),
    };
  }
}
