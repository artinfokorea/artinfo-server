import { ApiProperty } from '@nestjs/swagger';
import { ArrayType, Email, NotBlank } from '@/common/decorator/validator';
import { OnchurchUpsertMyChurchCommand } from '@/onchurch/church/application/command/onchurch-upsert-my-church.command';

export class OnchurchUpsertMyChurchRequest {
  @NotBlank()
  @ApiProperty({ type: String, required: true, description: '서브도메인 (영문 소문자/숫자/하이픈)', example: 'sungdong' })
  slug: string;

  @NotBlank()
  @ApiProperty({ type: String, required: true, description: '교회 이름 (한글)', example: '성동교회' })
  name: string;

  @ApiProperty({ type: String, required: false, description: '영문명', example: 'SUNGDONG CHURCH', nullable: true })
  eng: string | null;

  @ApiProperty({ type: String, required: false, description: '태그라인', nullable: true })
  tagline: string | null;

  @NotBlank()
  @ApiProperty({ type: String, required: true, description: '전화번호', example: '02-1234-5678' })
  phone: string;

  @NotBlank()
  @Email()
  @ApiProperty({ type: String, required: true, description: '이메일', example: 'hello@yourchurch.kr' })
  email: string;

  @NotBlank()
  @ApiProperty({ type: String, required: true, description: '주소', example: '서울특별시 ...' })
  address: string;

  @ApiProperty({ type: String, required: false, description: '대표자', nullable: true })
  representative: string | null;

  @ApiProperty({ type: String, required: false, description: '사업자등록번호', nullable: true })
  businessNo: string | null;

  @ApiProperty({ type: String, required: false, description: '로고 이미지 URL', nullable: true })
  logoUrl: string | null;

  @ArrayType()
  @ApiProperty({ type: [String], required: true, description: '활성화된 페이지 ID 배열', example: ['about', 'worship', 'notices'] })
  enabledPages: string[];

  toCommand(): OnchurchUpsertMyChurchCommand {
    return new OnchurchUpsertMyChurchCommand({
      slug: this.slug,
      name: this.name,
      eng: this.eng ?? null,
      tagline: this.tagline ?? null,
      phone: this.phone,
      email: this.email,
      address: this.address,
      representative: this.representative ?? null,
      businessNo: this.businessNo ?? null,
      logoUrl: this.logoUrl ?? null,
      enabledPages: this.enabledPages ?? [],
    });
  }
}
