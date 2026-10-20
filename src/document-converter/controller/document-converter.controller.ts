import { Query, Res, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiProduces, ApiQuery } from '@nestjs/swagger';
import { Response } from 'express';
import { RestApiController, RestApiGet, RestApiPost } from '@/common/decorator/rest-api';
import { UploadFile } from '@/common/type/type';
import { USER_TYPE } from '@/user/entity/user.entity';
import { documentConverterConfig } from '../document-converter.config';
import { DocumentConverterService } from '../service/document-converter.service';
import { DocumentFileRequired, DocumentPageNotFound } from '../exception/document-converter.exception';
import { ConvertWebpBody, ConvertWebpQuery } from '../dto/request/convert-webp.request';
import { DocumentConverterDoctorResponse, WebpConvertResponse } from '../dto/response/webp.response';

/**
 * HWP/HWPX/PDF → WebP 변환 API.
 * HWP 는 @rhwp/core(WASM) 로 SVG 렌더링 후 sharp 로 래스터화, PDF 는 poppler(pdftoppm) 로 찍는다. 어느 OS 에서나 동작.
 */
@RestApiController('/document-converter', 'DocumentConverter')
export class DocumentConverterController {
  constructor(private readonly documentConverterService: DocumentConverterService) {}

  @ApiConsumes('multipart/form-data')
  @ApiProduces('application/json', 'image/webp')
  @ApiBody({ type: ConvertWebpBody })
  @ApiQuery({ name: 'format', required: false, enum: ['json', 'webp'] })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'scale', required: false, type: Number })
  @ApiQuery({ name: 'quality', required: false, type: Number })
  @UseInterceptors(FilesInterceptor('file', 1, { limits: { fileSize: documentConverterConfig.maxFileBytes, files: 1 } }))
  @RestApiPost(WebpConvertResponse, {
    path: '/webp',
    description: 'HWP/HWPX/PDF 를 페이지별 WebP 로 변환',
    auth: [USER_TYPE.CLIENT],
  })
  async convertToWebp(@UploadedFiles() files: UploadFile[], @Query() query: ConvertWebpQuery, @Res() res: Response): Promise<void> {
    if (!files || files.length === 0) {
      throw new DocumentFileRequired();
    }
    const file = files[0];
    const result = await this.documentConverterService.convertToWebp(file.buffer, file.originalname, { scale: query.scale, quality: query.quality });

    if (query.format === 'webp') {
      const pageNo = Number(query.page ?? 1);
      const page = result.pages.find(p => p.page === pageNo);
      if (!page) {
        throw new DocumentPageNotFound(pageNo, result.pageCount);
      }
      res.setHeader('Content-Type', 'image/webp');
      res.setHeader('X-Page-Count', String(result.pageCount));
      res.setHeader('X-Page-Width', String(page.width));
      res.setHeader('X-Page-Height', String(page.height));
      res.status(200).send(page.data);
      return;
    }

    // @Res() 를 직접 쓰므로 공통 응답 봉투({ code, message, item }) 를 여기서 맞춘다
    res.status(200).json({ code: 'OK', message: null, item: new WebpConvertResponse(result) });
  }

  @RestApiGet(DocumentConverterDoctorResponse, {
    path: '/doctor',
    description: '변환 환경 점검 — @rhwp/core WASM 로드 · poppler 설치 (관리자 전용)',
    auth: [USER_TYPE.ADMIN],
  })
  async doctor(): Promise<DocumentConverterDoctorResponse> {
    return new DocumentConverterDoctorResponse(await this.documentConverterService.doctor());
  }
}
