import { ApiProperty } from '@nestjs/swagger';
import { MajorCategory } from '@/job/entity/major-category.entity';
import { MajorResponse } from '@/common/api/dto/response/majors.response';

export class MajorsResponse {
  @ApiProperty({ type: [MajorResponse], required: true, description: '전공 목록' })
  majors: MajorResponse[];

  constructor(majors: MajorCategory[]) {
    this.majors = majors.map(major => new MajorResponse(major));
  }
}
