import { Body } from '@nestjs/common';
import { RestApiController, RestApiPost } from '@/common/decorator/rest-api';
import { CreateExamRequest } from '@/tov/dto/request/create-exam.request';
import { CreateExamResponse } from '@/tov/dto/response/create-exam.response';
import { TovService } from '@/tov/service/tov.service';

@RestApiController('/tov/exams', 'Tov')
export class TovController {
  constructor(private readonly tovService: TovService) {}

  @RestApiPost(CreateExamResponse, { path: '/', description: '시험 생성' })
  async createExam(@Body() request: CreateExamRequest): Promise<CreateExamResponse> {
    const examId = await this.tovService.createExam(request);
    return new CreateExamResponse(examId);
  }
}
