import { ApiProperty } from '@nestjs/swagger';
import { DocumentConverterDoctor } from '../../service/document-converter.service';
import { WebpConvertResult, WebpPage } from '../../service/webp-types';

export class WebpPageResponse {
  @ApiProperty({ type: Number, description: '페이지 번호 (1부터)' }) page: number;
  @ApiProperty({ type: Number, description: '가로 픽셀' }) width: number;
  @ApiProperty({ type: Number, description: '세로 픽셀' }) height: number;
  @ApiProperty({ type: Number, description: '바이트 크기' }) bytes: number;
  @ApiProperty({ type: String, description: 'MIME 타입', example: 'image/webp' }) mimeType: string;
  @ApiProperty({ type: String, description: 'WebP 바이너리 (base64)' }) data: string;

  constructor(p: WebpPage) {
    this.page = p.page;
    this.width = p.width;
    this.height = p.height;
    this.bytes = p.bytes;
    this.mimeType = 'image/webp';
    this.data = p.data.toString('base64');
  }
}

export class WebpConvertResponse {
  @ApiProperty({ type: String, description: '원본 파일명' }) originalName: string;
  @ApiProperty({ type: String, enum: ['hwp', 'pdf'], description: '원본 종류' }) kind: string;
  @ApiProperty({ type: Number, description: '페이지 수' }) pageCount: number;
  @ApiProperty({ type: Number, description: '적용된 배율' }) scale: number;
  @ApiProperty({ type: Number, description: '적용된 WebP 품질' }) quality: number;
  @ApiProperty({ type: Number, description: '소요 시간(ms)' }) elapsedMs: number;
  @ApiProperty({ type: [WebpPageResponse], description: '페이지별 WebP' }) pages: WebpPageResponse[];

  constructor(r: WebpConvertResult) {
    this.originalName = r.originalName;
    this.kind = r.kind;
    this.pageCount = r.pageCount;
    this.scale = r.scale;
    this.quality = r.quality;
    this.elapsedMs = r.elapsedMs;
    this.pages = r.pages.map(p => new WebpPageResponse(p));
  }
}

export class DocumentConverterDoctorResponse {
  @ApiProperty({ type: Boolean, description: 'HWP · PDF 변환 모두 가능한지' }) ok: boolean;
  @ApiProperty({ type: Boolean, description: '@rhwp/core WASM 로드 여부' }) hwpOk: boolean;
  @ApiProperty({ type: String, required: false }) hwpVersion?: string;
  @ApiProperty({ type: String, required: false }) hwpError?: string;
  @ApiProperty({ type: Boolean, description: 'poppler(pdftoppm) 실행 가능 여부' }) pdfOk: boolean;
  @ApiProperty({ type: String, required: false }) pdfVersion?: string;
  @ApiProperty({ type: String, required: false }) pdfError?: string;
  @ApiProperty({ type: Number, description: '허용 최대 페이지 수' }) maxPages: number;
  @ApiProperty({ type: [String] }) supportedExtensions: string[];

  constructor(d: DocumentConverterDoctor) {
    this.ok = d.ok;
    this.hwpOk = d.hwp.ok;
    this.hwpVersion = d.hwp.version;
    this.hwpError = d.hwp.error;
    this.pdfOk = d.pdf.ok;
    this.pdfVersion = d.pdf.version;
    this.pdfError = d.pdf.error;
    this.maxPages = d.maxPages;
    this.supportedExtensions = d.supportedExtensions;
  }
}
