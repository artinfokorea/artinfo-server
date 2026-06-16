import { ApiProperty } from '@nestjs/swagger';
import { ArrayType, NotBlank } from '@/common/decorator/validator';
import { OnchurchUpsertMyChurchCommand } from '@/onchurch/church/application/command/onchurch-upsert-my-church.command';

export class OnchurchUpsertMyChurchRequest {
  @NotBlank()
  @ApiProperty({ type: String, required: true, description: '서브도메인 (영문 소문자/숫자/하이픈)', example: 'onchurch' })
  slug: string;

  @NotBlank()
  @ApiProperty({ type: String, required: true, description: '교회 이름 (한글)', example: '온교회' })
  name: string;

  @ApiProperty({ type: String, required: false, description: '영문명', example: 'ONCHURCH', nullable: true })
  eng: string | null;

  @ApiProperty({ type: String, required: false, description: '태그라인', nullable: true })
  tagline: string | null;

  @ApiProperty({ type: String, required: false, description: '전화번호 (사이트 운영 시 필수)', nullable: true })
  phone: string | null;

  @ApiProperty({ type: String, required: false, description: '이메일 (사이트 운영 시 필수)', nullable: true })
  email: string | null;

  @ApiProperty({ type: String, required: false, description: '주소 (사이트 운영 시 필수)', nullable: true })
  address: string | null;

  @ApiProperty({ type: String, required: false, description: '대표자', nullable: true })
  representative: string | null;

  @ApiProperty({ type: String, required: false, description: '사업자등록번호', nullable: true })
  businessNo: string | null;

  @ApiProperty({ type: String, required: false, description: '로고 이미지 URL', nullable: true })
  logoUrl: string | null;

  @ApiProperty({ type: String, required: false, description: '유튜브 채널 URL', nullable: true })
  youtubeUrl: string | null;

  @ApiProperty({ type: String, required: false, description: '라이브 영상 URL (watch?v=...)', nullable: true })
  liveUrl: string | null;

  @ApiProperty({ type: Boolean, required: false, description: '실시간 방송(라이브) 켜짐 여부', default: false })
  isLive?: boolean;

  @ArrayType()
  @ApiProperty({ type: [String], required: true, description: '활성화된 페이지 ID 배열', example: ['about', 'worship', 'notices'] })
  enabledPages: string[];

  @ArrayType()
  @ApiProperty({ type: [String], required: false, description: '홈페이지 섹션 노출 순서', example: ['banner', 'hero', 'worship', 'sermons', 'visit', 'pastor'] })
  homeSectionOrder?: string[];

  toCommand(): OnchurchUpsertMyChurchCommand {
    return new OnchurchUpsertMyChurchCommand({
      slug: this.slug,
      name: this.name,
      eng: this.eng ?? null,
      tagline: this.tagline ?? null,
      phone: this.phone ?? null,
      email: this.email ?? null,
      address: this.address ?? null,
      representative: this.representative ?? null,
      businessNo: this.businessNo ?? null,
      logoUrl: this.logoUrl ?? null,
      youtubeUrl: this.youtubeUrl ?? null,
      liveUrl: this.liveUrl ?? null,
      isLive: this.isLive ?? false,
      enabledPages: this.enabledPages ?? [],
      homeSectionOrder: this.homeSectionOrder ?? [],
    });
  }
}
