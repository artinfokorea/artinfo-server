import { Body } from '@nestjs/common';
import { RestApiController, RestApiPost } from '@/common/decorator/rest-api';
import { AuthSignature } from '@/common/decorator/AuthSignature';
import { UserSignature } from '@/common/type/type';
import { USER_TYPE } from '@/user/entity/user.entity';
import { OkResponse } from '@/common/response/ok.response';
import { OngiCreateReportUseCase } from '@/ongi/report/application/usecase/ongi-report.usecase';
import { OngiCreateReportRequest } from '@/ongi/report/presentation/dto/request/ongi-create-report.request';

@RestApiController('/ongi/reports', 'Ongi Report')
export class OngiReportController {
  constructor(private readonly createReportUseCase: OngiCreateReportUseCase) {}

  @RestApiPost(OkResponse, { path: '/', description: '사진·댓글·구성원 신고 — 운영자가 24시간 내 검토', auth: [USER_TYPE.CLIENT] })
  async createReport(@AuthSignature() signature: UserSignature, @Body() request: OngiCreateReportRequest) {
    await this.createReportUseCase.execute(signature.id, request.toCommand());

    return new OkResponse();
  }
}
