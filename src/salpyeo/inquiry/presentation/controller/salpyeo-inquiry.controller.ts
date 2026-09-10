import { Body, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiConsumes } from '@nestjs/swagger';
import { RestApiController, RestApiPost } from '@/common/decorator/rest-api';
import { UploadFile } from '@/common/type/type';
import { SalpyeoCreateInquiryUseCase } from '@/salpyeo/inquiry/application/usecase/salpyeo-inquiry.usecase';
import { SalpyeoCreateInquiryRequest } from '@/salpyeo/inquiry/presentation/dto/request/salpyeo-create-inquiry.request';
import { SalpyeoInquiryResponse } from '@/salpyeo/inquiry/presentation/dto/response/salpyeo-inquiry.response';

/** 한 문의에 붙일 수 있는 사진 수·크기 — 공개 API 라 넉넉하게 두지 않는다 */
export const SALPYEO_INQUIRY_MAX_FILES = 3;
export const SALPYEO_INQUIRY_MAX_FILE_SIZE = 5 * 1024 * 1024;

/** 문의 접수 — 로그인 없이 누구나 보낼 수 있다 */
@RestApiController('/salpyeo/inquiries', 'Salpyeo Inquiry')
export class SalpyeoInquiryController {
  constructor(private readonly createInquiryUseCase: SalpyeoCreateInquiryUseCase) {}

  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FilesInterceptor('imageFiles', SALPYEO_INQUIRY_MAX_FILES, { limits: { fileSize: SALPYEO_INQUIRY_MAX_FILE_SIZE } }))
  @RestApiPost(SalpyeoInquiryResponse, { path: '/', description: '문의 접수 (비로그인, 사진 최대 3장)' })
  async create(@Body() request: SalpyeoCreateInquiryRequest, @UploadedFiles() files?: UploadFile[]) {
    const inquiry = await this.createInquiryUseCase.execute({
      title: request.title.trim(),
      content: request.content.trim(),
      email: request.email.trim(),
      files: files ?? [],
    });

    return new SalpyeoInquiryResponse(inquiry);
  }
}
