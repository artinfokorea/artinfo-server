import { Module } from '@nestjs/common';
import { DocumentConverterController } from './controller/document-converter.controller';
import { DocumentConverterService } from './service/document-converter.service';
import { HwpWebpConverterService } from './service/hwp-webp-converter.service';
import { PdfWebpConverterService } from './service/pdf-webp-converter.service';

/**
 * HWP/HWPX/PDF → WebP 변환.
 * HWP: @rhwp/core (Rust→WASM) 로 SVG 렌더링 → sharp 래스터화. PDF: poppler pdftoppm → sharp.
 */
@Module({
  controllers: [DocumentConverterController],
  providers: [DocumentConverterService, HwpWebpConverterService, PdfWebpConverterService],
  exports: [DocumentConverterService],
})
export class DocumentConverterModule {}
