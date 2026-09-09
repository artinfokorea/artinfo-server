import { ApiProperty } from '@nestjs/swagger';
import { SalpyeoAuth } from '@/salpyeo/auth/domain/entity/salpyeo-auth.entity';
import { SalpyeoUser } from '@/salpyeo/user/domain/entity/salpyeo-user.entity';
import { SalpyeoUserResponse } from '@/salpyeo/user/presentation/dto/response/salpyeo-user.response';

export class SalpyeoAuthTokensResponse {
  @ApiProperty({ type: String, description: 'access token' })
  accessToken: string;

  @ApiProperty({ type: Date, description: 'access token 만료 시간' })
  accessTokenExpiresIn: Date;

  @ApiProperty({ type: String, description: 'refresh token' })
  refreshToken: string;

  @ApiProperty({ type: Date, description: 'refresh token 만료 시간' })
  refreshTokenExpiresIn: Date;

  constructor(auth: SalpyeoAuth) {
    this.accessToken = auth.accessToken;
    this.accessTokenExpiresIn = auth.accessTokenExpiresIn;
    this.refreshToken = auth.refreshToken;
    this.refreshTokenExpiresIn = auth.refreshTokenExpiresIn;
  }
}

export class SalpyeoLoginResponse {
  @ApiProperty({ type: SalpyeoUserResponse, description: '로그인한 사용자' })
  user: SalpyeoUserResponse;

  @ApiProperty({ type: SalpyeoAuthTokensResponse, description: '발급된 토큰' })
  tokens: SalpyeoAuthTokensResponse;

  constructor(user: SalpyeoUser, auth: SalpyeoAuth) {
    this.user = new SalpyeoUserResponse(user);
    this.tokens = new SalpyeoAuthTokensResponse(auth);
  }
}
