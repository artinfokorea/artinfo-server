import { Body, Query, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';
import { RestApiController, RestApiGet, RestApiPost } from '@/common/decorator/rest-api';
import { AuthSignature } from '@/common/decorator/AuthSignature';
import { UploadFile, UserSignature } from '@/common/type/type';
import { CreateResponse } from '@/common/response/createResponse';
import { USER_TYPE } from '@/user/entity/user.entity';
import { AdmissionService } from '@/admission/service/admission.service';
import { AdmissionPdfRequired } from '@/admission/exception/admission.exception';
import { ExtractAdmissionRequest } from '@/admission/dto/request/extract-admission.request';
import { GetAdmissionsRequest } from '@/admission/dto/request/get-admissions.request';
import { AdmissionsResponse } from '@/admission/dto/response/admissions.response';

@RestApiController('/admissions', 'Admission')
export class AdmissionController {
  constructor(private readonly admissionService: AdmissionService) {}

  @RestApiGet(AdmissionsResponse, { path: '/', description: '입시 목록 조회' })
  async getAdmissions(@Query() request: GetAdmissionsRequest): Promise<AdmissionsResponse> {
    const pagingItems = await this.admissionService.getAdmissions(request.toFetcher());
    return new AdmissionsResponse({ admissions: pagingItems.items, totalCount: pagingItems.totalCount });
  }

  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: ExtractAdmissionRequest })
  @UseInterceptors(
    FilesInterceptor('pdfFile', 1, {
      limits: {
        fileSize: 32 * 1024 * 1024,
        files: 1,
      },
    }),
  )
  @RestApiPost(CreateResponse, {
    path: '/extract',
    description: '입시 요강 PDF 업로드 및 데이터 추출 (관리자 전용)',
    auth: [USER_TYPE.ADMIN],
  })
  async extractAdmission(
    @AuthSignature() _signature: UserSignature,
    @Body() _request: ExtractAdmissionRequest,
    @UploadedFiles() files: UploadFile[],
  ): Promise<CreateResponse> {
    if (!files || files.length === 0) {
      throw new AdmissionPdfRequired();
    }

    const file = files[0];
    const admissionId = await this.admissionService.extractAndCreateFromPdf(file.buffer, file.originalname);
    return new CreateResponse(admissionId);
  }
}
