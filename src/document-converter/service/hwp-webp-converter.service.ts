import { Inject, Injectable, Optional } from '@nestjs/common';
import * as Sharp from 'sharp';
import { DOC_CONVERTER_HWP_CONFIG, DOC_CONVERTER_HWP_RENDERER, documentConverterConfig } from '../document-converter.config';
import { DocumentParseFailed, DocumentTooManyPages } from '../exception/document-converter.exception';
import { mapLimit } from '../util/map-limit';
import { HwpRendererDoctor, HwpRendererFactory, RhwpRendererFactory } from './hwp-renderer';
import { WebpConvertOptions, WebpPage, WebpPages } from './webp-types';

export interface HwpWebpConfig {
  maxPages: number;
  encodeConcurrency: number;
}

/** rhwp 의 SVG 는 96dpi 기준 px 단위라, sharp 에 72dpi × scale 을 주면 scale 배로 래스터화된다. */
const SVG_BASE_DENSITY = 72;

/**
 * HWP/HWPX → WebP. @rhwp/core 로 페이지를 SVG 로 렌더링한 뒤 sharp(librsvg) 로 래스터화한다.
 * 글꼴은 실행 환경의 fontconfig 를 따른다 (Dockerfile 의 fonts-nanum).
 */
@Injectable()
export class HwpWebpConverterService {
  private readonly factory: HwpRendererFactory;
  private readonly config: HwpWebpConfig;

  constructor(
    @Optional() @Inject(DOC_CONVERTER_HWP_RENDERER) factory?: HwpRendererFactory,
    @Optional() @Inject(DOC_CONVERTER_HWP_CONFIG) config?: Partial<HwpWebpConfig>,
  ) {
    this.factory = factory ?? new RhwpRendererFactory();
    this.config = {
      maxPages: config?.maxPages ?? documentConverterConfig.maxPages,
      encodeConcurrency: config?.encodeConcurrency ?? documentConverterConfig.encodeConcurrency,
    };
  }

  async convert(buffer: Buffer, options: WebpConvertOptions): Promise<WebpPages> {
    const svgs = await this.renderSvgs(buffer);
    const pages = await mapLimit(svgs, this.config.encodeConcurrency, (svg, i) => this.rasterize(svg, i + 1, options));
    return { pageCount: pages.length, pages };
  }

  doctor(): Promise<HwpRendererDoctor> {
    return this.factory.doctor();
  }

  private async renderSvgs(buffer: Buffer): Promise<string[]> {
    let doc;
    try {
      doc = await this.factory.open(new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength));
    } catch (e) {
      throw new DocumentParseFailed('HWP 파일을 열 수 없습니다. 손상되었거나 지원하지 않는 형식입니다.', { reason: errorMessage(e) });
    }
    try {
      const pageCount = doc.pageCount();
      if (pageCount <= 0) throw new DocumentParseFailed('HWP 문서에 페이지가 없습니다.');
      if (pageCount > this.config.maxPages) throw new DocumentTooManyPages(pageCount, this.config.maxPages);
      const svgs: string[] = [];
      for (let i = 0; i < pageCount; i++) {
        try {
          svgs.push(doc.renderPageSvg(i));
        } catch (e) {
          throw new DocumentParseFailed(`HWP ${i + 1} 페이지를 렌더링하지 못했습니다.`, { page: i + 1, reason: errorMessage(e) });
        }
      }
      return svgs;
    } finally {
      doc.free();
    }
  }

  private async rasterize(svg: string, page: number, options: WebpConvertOptions): Promise<WebpPage> {
    try {
      const { data, info } = await Sharp(Buffer.from(svg), { density: SVG_BASE_DENSITY * options.scale })
        .webp({ quality: options.quality })
        .toBuffer({ resolveWithObject: true });
      return { page, width: info.width, height: info.height, bytes: data.length, data };
    } catch (e) {
      throw new DocumentParseFailed(`${page} 페이지를 WebP 로 변환하지 못했습니다.`, { page, reason: errorMessage(e) });
    }
  }
}

function errorMessage(e: unknown): string {
  if (e instanceof Error) return e.message;
  return typeof e === 'string' ? e : JSON.stringify(e);
}
