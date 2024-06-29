import { RestApiController, RestApiGet } from '@/common/decorator/rest-api';
import { MajorsResponse } from '@/major/dto/response/majors.response';
import { MajorService } from '@/major/major.service';
import { MajorGroupsResponse } from '@/major/dto/response/major-groups.response';
import { MajorFieldsRequest } from '@/major/dto/request/major-groups.request';
import { Query } from '@nestjs/common';

@RestApiController('/majors', 'major')
export class MajorController {
  constructor(private readonly commonService: MajorService) {}

  @RestApiGet(MajorsResponse, { path: '/', description: '전공 목록 조회' })
  async getMajors() {
    const majors = await this.commonService.getAllMajors();

    return new MajorsResponse(majors);
  }

  @RestApiGet(MajorGroupsResponse, { path: '/groups/art', description: '예술 분야 목록 조회' })
  async getMajorGroupArt() {
    const majors = await this.commonService.getMajorArt();

    return new MajorGroupsResponse(majors);
  }

  @RestApiGet(MajorGroupsResponse, { path: '/groups/fields', description: '전문 분야 조회' })
  async getMajorGroupFields(@Query() request: MajorFieldsRequest) {
    const majors = await this.commonService.getMajorFields(request.artCategories);

    return new MajorGroupsResponse(majors);
  }
}
