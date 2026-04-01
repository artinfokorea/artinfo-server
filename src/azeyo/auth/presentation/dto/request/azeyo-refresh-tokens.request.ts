import { ApiProperty } from '@nestjs/swagger';
import { NotBlank } from '@/common/decorator/validator';

export class AzeyoRefreshTokensRequest {
  @NotBlank()
  @ApiProperty({ type: String, required: true, description: 'access token', example: 'access_token_here' })
  accessToken: string;

  @NotBlank()
  @ApiProperty({ type: String, required: true, description: 'refresh token', example: 'refresh_token_here' })
  refreshToken: string;
}
