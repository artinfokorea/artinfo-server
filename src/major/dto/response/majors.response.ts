import { ApiProperty } from '@nestjs/swagger';
import { MAJOR, MAJOR_CATEGORY, MajorCategory } from '@/job/entity/major-category.entity';

export class MajorResponse {
  @ApiProperty({ type: Number, required: true, description: '전공 아이디', example: 1 })
  id: number;

  @ApiProperty({ type: String, required: true, description: '그룹 이름 한국어', example: '현악기' })
  koGroup: string;

  @ApiProperty({
    enum: MAJOR_CATEGORY,
    enumName: 'MAJOR_CATEGORY',
    required: true,
    description: '그룹 이름 영어',
    example: MAJOR_CATEGORY.MUSIC_MAJOR_ADMINISTRATION,
  })
  enGroup: MAJOR_CATEGORY;

  @ApiProperty({ type: String, required: true, description: '전공 이름 한국어', example: '작곡' })
  koName: string;

  @ApiProperty({ enum: MAJOR, enumName: 'MAJOR', required: true, description: '전공 이름 영어', example: MAJOR.ALTO })
  enName: MAJOR;

  constructor(major: MajorCategory) {
    this.id = major.id;
    this.koGroup = major.koGroup;
    this.enGroup = major.enGroup;
    this.koName = major.koName;
    this.enName = major.enName;
  }
}
