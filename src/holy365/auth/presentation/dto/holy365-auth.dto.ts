import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import { HOLY365_SNS_PROVIDER } from '@/holy365/auth/domain/service/holy365-oauth';
import { Holy365Auth } from '@/holy365/auth/domain/entity/holy365-auth.entity';
import { Holy365User } from '@/holy365/user/domain/entity/holy365-user.entity';
import { Holy365UserResponse } from '@/holy365/user/presentation/dto/holy365-user.dto';

export class Holy365SignupRequest {
  @IsString()
  @MaxLength(254)
  @ApiProperty({ example: 'grace@example.com' })
  email: string;

  @IsString()
  @MaxLength(64)
  @ApiProperty({ example: 'grace2026', description: '8~64자, 영문과 숫자 포함' })
  password: string;

  @IsString()
  @MaxLength(60)
  @ApiProperty({ example: '은혜' })
  name: string;

  @IsOptional()
  @IsIn(['ko', 'zh'])
  @ApiProperty({ required: false, enum: ['ko', 'zh'] })
  locale?: string;
}

export class Holy365LoginRequest {
  @IsString()
  @MaxLength(254)
  @ApiProperty({ example: 'grace@example.com' })
  email: string;

  @IsString()
  @MaxLength(64)
  @ApiProperty({ example: 'grace2026' })
  password: string;
}

export class Holy365AuthorizeUrlRequest {
  @IsString()
  @MaxLength(500)
  @ApiProperty({ example: 'http://localhost:3000/ko/auth/callback/google' })
  redirectUri: string;

  @IsString()
  @MaxLength(100)
  @ApiProperty({ description: '프론트가 만든 CSRF state — 콜백에서 그대로 돌아온다' })
  state: string;
}

export class Holy365SnsLoginRequest {
  @IsEnum(HOLY365_SNS_PROVIDER)
  @ApiProperty({ enum: HOLY365_SNS_PROVIDER })
  provider: HOLY365_SNS_PROVIDER;

  @IsString()
  @MaxLength(2000)
  @ApiProperty({ description: '콜백으로 받은 authorization code' })
  code: string;

  @IsString()
  @MaxLength(500)
  @ApiProperty({ description: '로그인 화면을 열 때 쓴 redirect_uri (토큰 교환에 같은 값이 필요하다)' })
  redirectUri: string;

  @IsString()
  @MaxLength(100)
  @ApiProperty()
  state: string;

  @IsOptional()
  @IsIn(['ko', 'zh'])
  @ApiProperty({ required: false, enum: ['ko', 'zh'] })
  locale?: string;
}

export class Holy365RefreshRequest {
  @IsString()
  @ApiProperty()
  refreshToken: string;
}

export class Holy365AuthorizeUrlResponse {
  @ApiProperty()
  url: string;

  constructor(url: string) {
    this.url = url;
  }
}

export class Holy365TokensResponse {
  @ApiProperty()
  accessToken: string;

  @ApiProperty()
  accessTokenExpiresIn: Date;

  @ApiProperty()
  refreshToken: string;

  @ApiProperty()
  refreshTokenExpiresIn: Date;

  constructor(auth: Holy365Auth) {
    this.accessToken = auth.accessToken;
    this.accessTokenExpiresIn = auth.accessTokenExpiresIn;
    this.refreshToken = auth.refreshToken;
    this.refreshTokenExpiresIn = auth.refreshTokenExpiresIn;
  }
}

export class Holy365LoginResponse {
  @ApiProperty({ type: Holy365UserResponse })
  user: Holy365UserResponse;

  @ApiProperty({ type: Holy365TokensResponse })
  tokens: Holy365TokensResponse;

  constructor(user: Holy365User, auth: Holy365Auth) {
    this.user = new Holy365UserResponse(user);
    this.tokens = new Holy365TokensResponse(auth);
  }
}
