import { ApiProperty } from '@nestjs/swagger';
import { OnchurchAuth } from '@/onchurch/auth/domain/entity/onchurch-auth.entity';

export class OnchurchAuthTokensResponse {
  @ApiProperty({ type: 'string', required: true, description: 'access token' })
  accessToken: string;

  @ApiProperty({ type: 'date', required: true, description: 'access token 만료 시간' })
  accessTokenExpiresIn: Date;

  @ApiProperty({ type: 'string', required: true, description: 'refresh token' })
  refreshToken: string;

  @ApiProperty({ type: 'date', required: true, description: 'refresh token 만료 시간' })
  refreshTokenExpiresIn: Date;

  constructor(auth: OnchurchAuth) {
    this.accessToken = auth.accessToken;
    this.accessTokenExpiresIn = auth.accessTokenExpiresIn;
    this.refreshToken = auth.refreshToken;
    this.refreshTokenExpiresIn = auth.refreshTokenExpiresIn;
  }
}
