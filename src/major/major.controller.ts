import { RestApiController, RestApiGet } from '@/common/decorator/rest-api';
import { MajorsResponse } from '@/major/dto/response/major.response';
import { MajorService } from '@/major/major.service';

@RestApiController('/majors', 'major')
export class MajorController {
  constructor(private readonly commonService: MajorService) {}

  @RestApiGet(MajorsResponse, { path: '/', description: '전공 목록 조회' })
  async getMajors() {
    const majors = await this.commonService.getMajors();

    return new MajorsResponse(majors);
  }
}
