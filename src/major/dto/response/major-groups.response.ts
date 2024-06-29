import { ApiProperty } from '@nestjs/swagger';
import { MajorGroupResponse } from '@/major/dto/response/major-group.response';
import { MajorGroupPayload } from '@/major/repository/payload/major-group.payload';

export class MajorGroupsResponse {
  @ApiProperty({ type: [MajorGroupResponse], required: true, description: '전공 목록' })
  majorGroups: MajorGroupResponse[];

  constructor(majors: MajorGroupPayload[]) {
    this.majorGroups = majors.map(major => new MajorGroupResponse({ nameKo: major.nameKo, nameEn: major.nameEn }));
  }
}
