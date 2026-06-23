import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsOptional, MaxLength, ValidateIf } from 'class-validator';
import { IsPhone, NotBlank } from '@/common/decorator/validator';
import { OnchurchSignupCommand, ONCHURCH_REFERRAL_SOURCES, OnchurchReferralSource } from '@/onchurch/auth/application/command/onchurch-signup.command';

export class OnchurchSignupRequest {
  @NotBlank()
  @ApiProperty({ type: String, required: true, description: '아이디 (4자 이상)', example: 'test01' })
  userId: string;

  @NotBlank()
  @ApiProperty({ type: String, required: true, description: '비밀번호 (8자 이상)', example: 'pw12345678' })
  password: string;

  @NotBlank()
  @ApiProperty({ type: String, required: true, description: '이름', example: '홍길동' })
  name: string;

  @NotBlank()
  @IsPhone()
  @ApiProperty({ type: String, required: true, description: '휴대폰 번호 (010-XXXX-XXXX)', example: '010-1234-5678' })
  phone: string;

  @ApiProperty({ type: Boolean, required: false, description: '마케팅 정보 수신 동의', example: false, default: false })
  marketingConsent: boolean;

  // 유입경로는 랜딩 페이지 가입(churchSlug 없음)에서만 필수. 교회 페이지 성도 가입은 받지 않는다.
  @ValidateIf((o) => !o.churchSlug)
  @NotBlank()
  @IsIn(ONCHURCH_REFERRAL_SOURCES)
  @ApiProperty({ type: String, required: false, enum: ONCHURCH_REFERRAL_SOURCES, description: '유입경로 (네이버/인스타그램/메일/기타) — 랜딩 가입 시 필수', example: 'naver' })
  referralSource?: OnchurchReferralSource;

  // 유입경로가 기타(etc)일 때 직접 입력한 내용 — 필수.
  @ValidateIf((o) => o.referralSource === 'etc')
  @NotBlank()
  @MaxLength(200)
  @ApiProperty({ type: String, required: false, description: '유입경로가 기타(etc)일 때 직접 입력한 내용', nullable: true, example: '지인 추천' })
  referralSourceEtc?: string | null;

  @IsOptional()
  @MaxLength(120)
  @ApiProperty({ type: String, required: false, description: '소속 교회 slug (교회 페이지에서 성도 가입 시)', nullable: true, example: 'sungdong' })
  churchSlug?: string | null;

  toCommand(): OnchurchSignupCommand {
    return new OnchurchSignupCommand({
      userId: this.userId,
      password: this.password,
      name: this.name,
      phone: this.phone,
      marketingConsent: this.marketingConsent ?? false,
      churchSlug: (this.churchSlug ?? '').trim() || null,
      referralSource: this.referralSource ?? null,
      referralSourceEtc: this.referralSource === 'etc' ? (this.referralSourceEtc ?? '').trim() || null : null,
    });
  }
}
