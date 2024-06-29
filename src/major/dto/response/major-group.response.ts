import { ApiProperty } from '@nestjs/swagger';

export class MajorGroupResponse {
  @ApiProperty({ type: String, required: true, description: '그룹 한국어 이름' })
  nameKo: string;

  @ApiProperty({ type: String, required: true, description: '그룹 영어 이름' })
  nameEn: string;

  constructor({ nameKo, nameEn }: { nameKo: string; nameEn: string }) {
    this.nameKo = nameKo;
    this.nameEn = nameEn;
  }
}
