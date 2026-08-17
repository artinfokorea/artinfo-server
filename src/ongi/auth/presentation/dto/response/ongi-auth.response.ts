import { ApiProperty } from '@nestjs/swagger';
import { OngiAuth } from '@/ongi/auth/domain/entity/ongi-auth.entity';
import { OngiUser } from '@/ongi/user/domain/entity/ongi-user.entity';
import { OngiUserResponse } from '@/ongi/user/presentation/dto/response/ongi-user.response';

export class OngiAuthTokensResponse {
  @ApiProperty({ type: String, description: 'access token' })
  accessToken: string;

  @ApiProperty({ type: Date, description: 'access token 만료 시간' })
  accessTokenExpiresIn: Date;

  @ApiProperty({ type: String, description: 'refresh token' })
  refreshToken: string;

  @ApiProperty({ type: Date, description: 'refresh token 만료 시간' })
  refreshTokenExpiresIn: Date;

  constructor(auth: OngiAuth) {
    this.accessToken = auth.accessToken;
    this.accessTokenExpiresIn = auth.accessTokenExpiresIn;
    this.refreshToken = auth.refreshToken;
    this.refreshTokenExpiresIn = auth.refreshTokenExpiresIn;
  }
}

export class OngiLoginResponse {
  @ApiProperty({ type: OngiUserResponse, description: '로그인한 사용자' })
  user: OngiUserResponse;

  @ApiProperty({ type: OngiAuthTokensResponse, description: '발급된 토큰' })
  tokens: OngiAuthTokensResponse;

  constructor(user: OngiUser, auth: OngiAuth) {
    this.user = new OngiUserResponse(user);
    this.tokens = new OngiAuthTokensResponse(auth);
  }
}
