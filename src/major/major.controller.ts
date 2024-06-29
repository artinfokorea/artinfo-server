import { RestApiController, RestApiGet } from '@/common/decorator/rest-api';
import { MajorsResponse } from '@/major/dto/response/majors.response';
import { MajorService } from '@/major/major.service';
import { Query } from '@nestjs/common';
import { MajorGroupsRequest } from '@/major/dto/request/major-groups.request';
import { MajorGroupsResponse } from '@/major/dto/response/major-groups.response';

@RestApiController('/majors', 'major')
export class MajorController {
  constructor(private readonly commonService: MajorService) {}

  @RestApiGet(MajorsResponse, { path: '/', description: '전공 목록 조회' })
  async getMajors() {
    const majors = await this.commonService.getAllMajors();

    return new MajorsResponse(majors);
  }

  @RestApiGet(MajorGroupsResponse, { path: '/groups', description: '전공 목록 조회' })
  async getMajorGroups(@Query() request: MajorGroupsRequest) {
    const majors = await this.commonService.getMajorGroups(request.firstCategory);

    return new MajorGroupsResponse(majors);
  }
}
