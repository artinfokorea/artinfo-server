import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import { HOLY365_SNS_PROVIDER } from '@/holy365/auth/domain/service/holy365-oauth';
import { Holy365Auth } from '@/holy365/auth/domain/entity/holy365-auth.entity';
import { Holy365User } from '@/holy365/user/domain/entity/holy365-user.entity';
import { Holy365UserResponse } from '@/holy365/user/presentation/dto/holy365-user.dto';

export class Holy365DevLoginRequest {
  @IsOptional()
  @IsIn(['ko', 'en'])
  @ApiProperty({ required: false, enum: ['ko', 'en'] })
  locale?: string;
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
  @IsIn(['ko', 'en'])
  @ApiProperty({ required: false, enum: ['ko', 'en'] })
  locale?: string;
}

export class Holy365AppleLoginRequest {
  @IsString()
  @MaxLength(4000)
  @ApiProperty({ description: 'iOS Sign in with Apple 의 identityToken' })
  identityToken: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  @ApiProperty({ required: false, description: '첫 로그인 때만 애플이 주는 이름' })
  givenName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  @ApiProperty({ required: false })
  familyName?: string;

  @IsOptional()
  @IsIn(['ko', 'en'])
  @ApiProperty({ required: false, enum: ['ko', 'en'] })
  locale?: string;
}

export class Holy365GoogleNativeLoginRequest {
  @IsString()
  @MaxLength(4000)
  @ApiProperty({ description: 'iOS 구글 로그인의 idToken' })
  idToken: string;

  @IsOptional()
  @IsIn(['ko', 'en'])
  @ApiProperty({ required: false, enum: ['ko', 'en'] })
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
