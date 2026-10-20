export interface WebpConvertOptions {
  /** 출력 배율 (1 = 96dpi) */
  scale: number;
  /** WebP 품질 1~100 */
  quality: number;
}

export interface WebpPage {
  page: number;
  width: number;
  height: number;
  bytes: number;
  data: Buffer;
}

export interface WebpPages {
  pageCount: number;
  pages: WebpPage[];
}

export type DocumentKind = 'hwp' | 'pdf';

export interface WebpConvertResult extends WebpPages {
  originalName: string;
  kind: DocumentKind;
  scale: number;
  quality: number;
  elapsedMs: number;
}
