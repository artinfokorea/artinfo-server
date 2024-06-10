import { RestApiController, RestApiGet } from '@/common/decorator/rest-api';
import { MajorsResponse } from '@/common/api/dto/response/major.response';
import { CommonService } from '@/common/api/common.service';

@RestApiController('/common', 'Common')
export class CommonController {
  constructor(private readonly commonService: CommonService) {}

  @RestApiGet(MajorsResponse, { path: '/majors', description: '전공 목록 조회' })
  async getMajors() {
    const majors = await this.commonService.getMajors();

    return new MajorsResponse(majors);
  }
}
