import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, MaxLength } from 'class-validator';
import { IsPhone, NotBlank } from '@/common/decorator/validator';

export class OnchurchFindLoginIdsRequest {
  @NotBlank()
  @IsPhone()
  @ApiProperty({ type: String, required: true, description: '휴대폰 번호 (010-XXXX-XXXX)', example: '010-1234-5678' })
  phone: string;

  @IsOptional()
  @MaxLength(120)
  @ApiProperty({ type: String, required: false, description: '교회 사이트에서 찾는 경우 해당 교회 slug (해당 교회 소속 계정만 조회)', nullable: true, example: 'sungdong' })
  churchSlug?: string | null;
}
