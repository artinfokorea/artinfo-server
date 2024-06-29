import { ApiProperty } from '@nestjs/swagger';
import { ART_CATEGORY, MAJOR, MajorCategory, PROFESSIONAL_FIELD_CATEGORY } from '@/job/entity/major-category.entity';

export class MajorResponse {
  @ApiProperty({ type: Number, required: true, description: '전공 아이디', example: 1 })
  id: number;

  @ApiProperty({ type: String, required: true, description: '예술 분야 이름 한국어', example: '미술' })
  firstGroupKo: string;

  @ApiProperty({
    enum: ART_CATEGORY,
    enumName: 'ART_CATEGORY',
    required: true,
    description: '예술 분야 이름 영어',
    example: ART_CATEGORY.ART,
  })
  firstGroupEn: ART_CATEGORY;

  @ApiProperty({ type: String, required: true, description: '전문 분야 이름 한국어', example: '클래식' })
  secondGroupKo: string;

  @ApiProperty({
    enum: PROFESSIONAL_FIELD_CATEGORY,
    enumName: 'PROFESSIONAL_FIELD_CATEGORY',
    required: true,
    description: '전문 분야 이름 영어',
    example: PROFESSIONAL_FIELD_CATEGORY.CLASSIC,
  })
  secondGroupEn: PROFESSIONAL_FIELD_CATEGORY;

  @ApiProperty({ type: String, required: true, description: '전공 이름 한국어', example: '작곡' })
  koName: string;

  @ApiProperty({ enum: String, required: true, description: '전공 이름 영어', example: MAJOR.ALTO })
  enName: string;

  constructor(major: MajorCategory) {
    this.id = major.id;
    this.firstGroupKo = major.firstGroupKo;
    this.firstGroupEn = major.firstGroupEn;
    this.secondGroupKo = major.secondGroupKo;
    this.secondGroupEn = major.secondGroupEn;
    this.koName = major.koName;
    this.enName = major.enName;
  }
}
