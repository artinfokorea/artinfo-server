const env = (key: string, fallback: string): string => process.env[key] ?? fallback;

/** HWP/PDF → WebP 변환 설정. 모두 환경 변수로 바꿀 수 있다. */
export const documentConverterConfig = {
  /** 출력 배율. 1 = 96dpi(A4 가로 약 794px), 2 = 약 1588px */
  defaultScale: 2,
  maxScale: 4,
  /** WebP 품질 (1~100) */
  defaultQuality: 80,
  /** 이 페이지 수를 넘는 문서는 거절한다 */
  maxPages: Number(env('DOC_CONVERTER_MAX_PAGES', '100')),
  /** 업로드 파일 최대 크기 */
  maxFileBytes: 50 * 1024 * 1024,
  /** poppler 실행 파일 (Dockerfile 의 poppler-utils) */
  pdftoppmPath: env('DOC_CONVERTER_PDFTOPPM', 'pdftoppm'),
  pdfinfoPath: env('DOC_CONVERTER_PDFINFO', 'pdfinfo'),
  pdfTimeoutMs: Number(env('DOC_CONVERTER_PDF_TIMEOUT_MS', '120000')),
  /** 동시에 WebP 로 인코딩할 페이지 수 */
  encodeConcurrency: 4,
};

export const HWP_EXTENSIONS = new Set(['.hwp', '.hwpx', '.hwt', '.hwtx']);
export const PDF_EXTENSIONS = new Set(['.pdf']);

/** 테스트에서 가짜 렌더러·exec 를 주입할 때 쓰는 DI 토큰 */
export const DOC_CONVERTER_HWP_RENDERER = 'DOC_CONVERTER_HWP_RENDERER';
export const DOC_CONVERTER_EXEC = 'DOC_CONVERTER_EXEC';
export const DOC_CONVERTER_HWP_CONFIG = 'DOC_CONVERTER_HWP_CONFIG';
export const DOC_CONVERTER_PDF_CONFIG = 'DOC_CONVERTER_PDF_CONFIG';
