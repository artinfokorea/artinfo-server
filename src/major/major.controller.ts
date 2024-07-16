import { RestApiController, RestApiGet } from '@/common/decorator/rest-api';
import { MajorsResponse } from '@/major/dto/response/majors.response';
import { MajorService } from '@/major/major.service';
import { MajorGroupsResponse } from '@/major/dto/response/major-groups.response';

@RestApiController('/majors', 'major')
export class MajorController {
  constructor(private readonly commonService: MajorService) {}

  @RestApiGet(MajorsResponse, { path: '/', description: '전공 목록 조회' })
  async getMajors() {
    const majors = await this.commonService.getAllMajors();

    return new MajorsResponse(majors);
  }

  @RestApiGet(MajorGroupsResponse, { path: '/fields', description: '전문 분야 조회' })
  async getMajorGroupFields() {
    const majors = await this.commonService.getMajorFields([]);

    return new MajorGroupsResponse(majors);
  }
}
