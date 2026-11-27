import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import { HOLY365_EMAIL_TYPE, Holy365User } from '@/holy365/user/domain/entity/holy365-user.entity';

export class Holy365UserResponse {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ nullable: true })
  email: string | null;

  @ApiProperty({ description: "'email' | google | kakao | naver" })
  provider: string;

  @ApiProperty({ nullable: true })
  iconImageUrl: string | null;

  @ApiProperty({ enum: ['ko', 'zh'] })
  locale: string;

  @ApiProperty({ description: '비밀번호 변경 가능 여부 (이메일 가입)' })
  hasPassword: boolean;

  @ApiProperty()
  createdAt: Date;

  constructor(user: Holy365User) {
    this.id = String(user.id);
    this.name = user.name;
    this.email = user.email;
    this.provider = user.snsType;
    this.iconImageUrl = user.iconImageUrl;
    this.locale = user.locale;
    this.hasPassword = user.snsType === HOLY365_EMAIL_TYPE;
    this.createdAt = user.createdAt;
  }
}

export class Holy365UpdateMeRequest {
  @IsOptional()
  @IsString()
  @MaxLength(60)
  @ApiProperty({ required: false })
  name?: string;

  @IsOptional()
  @IsIn(['ko', 'zh'])
  @ApiProperty({ required: false, enum: ['ko', 'zh'] })
  locale?: string;
}

export class Holy365ChangePasswordRequest {
  @IsString()
  @MaxLength(64)
  @ApiProperty()
  currentPassword: string;

  @IsString()
  @MaxLength(64)
  @ApiProperty()
  newPassword: string;
}
