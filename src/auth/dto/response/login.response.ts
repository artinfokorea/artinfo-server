import { ApiProperty } from '@nestjs/swagger';
import { Auth } from '@/auth/entity/auth.entity';

export class LoginResponse {
  @ApiProperty({ type: 'string', required: true, description: 'access token', example: 'dkfjlkf12fF33' })
  accessToken: string;

  @ApiProperty({ type: 'date', required: true, description: 'access token 만료 시간', example: new Date() })
  accessTokenExpiresIn: Date;

  @ApiProperty({ type: 'string', required: true, description: 'access token', example: 'dkfjlkf12fF33' })
  refreshToken: string;

  @ApiProperty({ type: 'date', required: true, description: 'refresh token 만료 시간', example: new Date() })
  refreshTokenExpiresIn: Date;

  constructor(auth: Auth) {
    this.accessToken = auth.accessToken;
    this.accessTokenExpiresIn = auth.accessTokenExpiresIn;
    this.refreshToken = auth.refreshToken;
    this.refreshTokenExpiresIn = auth.refreshTokenExpiresIn;
  }
}
