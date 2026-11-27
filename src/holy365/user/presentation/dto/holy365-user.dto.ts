import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsIn, IsInt, IsOptional, IsString, MaxLength, ValidateIf } from 'class-validator';
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

  @ApiProperty({ nullable: true, description: '내 교회 { id, name, region, memberCount }' })
  church: { id: string; name: string; region: string; memberCount: number } | null;

  @ApiProperty({ description: '진행 상황 공개 여부' })
  profilePublic: boolean;

  constructor(user: Holy365User, church: Holy365UserResponse['church'] = null) {
    this.id = String(user.id);
    this.name = user.name;
    this.email = user.email;
    this.provider = user.snsType;
    this.iconImageUrl = user.iconImageUrl;
    this.locale = user.locale;
    this.createdAt = user.createdAt;
    this.church = church;
    this.profilePublic = user.profilePublic;
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

  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsInt()
  @ApiProperty({ required: false, nullable: true, description: '내 교회 id (null 이면 교회 해제)' })
  churchId?: number | null;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({ required: false })
  profilePublic?: boolean;
}
