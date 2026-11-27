import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import { Holy365User } from '@/holy365/user/domain/entity/holy365-user.entity';

export class Holy365UserResponse {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ nullable: true })
  email: string | null;

  @ApiProperty({ description: 'google | kakao | naver' })
  provider: string;

  @ApiProperty({ nullable: true })
  iconImageUrl: string | null;

  @ApiProperty({ enum: ['ko', 'en'] })
  locale: string;

  @ApiProperty()
  createdAt: Date;

  constructor(user: Holy365User) {
    this.id = String(user.id);
    this.name = user.name;
    this.email = user.email;
    this.provider = user.snsType;
    this.iconImageUrl = user.iconImageUrl;
    this.locale = user.locale;
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
  @IsIn(['ko', 'en'])
  @ApiProperty({ required: false, enum: ['ko', 'en'] })
  locale?: string;
}
