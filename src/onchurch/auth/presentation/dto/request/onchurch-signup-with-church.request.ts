import { ApiProperty } from '@nestjs/swagger';
import { Equals, Matches, MaxLength, MinLength } from 'class-validator';
import { Email, IsPhone, NotBlank } from '@/common/decorator/validator';
import { OnchurchSignupWithChurchCommand } from '@/onchurch/auth/application/command/onchurch-signup-with-church.command';

export class OnchurchSignupWithChurchRequest {
  // 서브도메인 = 로그인 아이디. 소문자/숫자/하이픈, 4~120자. (하이픈은 처음/끝 불가)
  @NotBlank()
  @MinLength(4)
  @MaxLength(120)
  @Matches(/^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/, { message: '서브도메인은 소문자·숫자·하이픈만 사용할 수 있습니다.' })
  @ApiProperty({ type: String, required: true, description: '서브도메인(=아이디). 소문자/숫자/하이픈 4자 이상', example: 'sungdong' })
  slug: string;

  @NotBlank()
  @MaxLength(120)
  @ApiProperty({ type: String, required: true, description: '교회 이름(=계정 이름)', example: '성동교회' })
  churchName: string;

  @NotBlank()
  @IsPhone()
  @ApiProperty({ type: String, required: true, description: '휴대폰 번호 (010-XXXX-XXXX)', example: '010-1234-5678' })
  phone: string;

  @NotBlank()
  @Email()
  @ApiProperty({ type: String, required: true, description: '교회 이메일', example: 'hello@sungdong.church' })
  email: string;

  @NotBlank()
  @MaxLength(200)
  @ApiProperty({ type: String, required: true, description: '교회 주소', example: '서울특별시 성동구 ...' })
  address: string;

  @NotBlank()
  @MaxLength(60)
  @ApiProperty({ type: String, required: true, description: '담임목사 성함', example: '홍길동' })
  pastorName: string;

  @NotBlank()
  @MaxLength(60)
  @ApiProperty({ type: String, required: true, description: '대표 예배 이름', example: '주일예배' })
  worshipName: string;

  @NotBlank()
  @MaxLength(60)
  @ApiProperty({ type: String, required: true, description: '대표 예배 시간', example: '주일 오전 11:00' })
  worshipTime: string;

  @Equals(true, { message: '이용약관 및 개인정보 처리방침에 동의해야 합니다.' })
  @ApiProperty({ type: Boolean, required: true, description: '약관 동의 (true 필수)', example: true })
  agree: boolean;

  toCommand(): OnchurchSignupWithChurchCommand {
    return new OnchurchSignupWithChurchCommand({
      slug: this.slug.trim().toLowerCase(),
      churchName: this.churchName.trim(),
      phone: this.phone.trim(),
      email: this.email.trim(),
      address: this.address.trim(),
      pastorName: this.pastorName.trim(),
      worshipName: this.worshipName.trim(),
      worshipTime: this.worshipTime.trim(),
    });
  }
}
