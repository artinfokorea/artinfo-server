import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, MaxLength } from 'class-validator';
import { Enum } from '@/common/decorator/validator';
import { ONGI_SNS_TYPE } from '@/ongi/user/domain/entity/ongi-user.entity';

export class OngiSnsLoginRequest {
  @Enum(ONGI_SNS_TYPE)
  @ApiProperty({ enum: ONGI_SNS_TYPE, required: true, description: 'SNS 로그인 제공자', example: ONGI_SNS_TYPE.KAKAO })
  provider: ONGI_SNS_TYPE;

  @IsOptional()
  @ApiProperty({ type: String, required: false, description: 'SNS access token (Apple 은 identity token). 앱 OAuth 연동 전에는 생략 가능 — 개발용 로그인', example: 'sns_access_token' })
  token?: string;

  @IsOptional()
  @MaxLength(40)
  @ApiProperty({ type: String, required: false, description: '가입 시 사용할 이름 (SNS 프로필 이름이 없을 때 — Apple 은 최초 로그인 시 앱이 전달)', example: '수진' })
  name?: string;
}
