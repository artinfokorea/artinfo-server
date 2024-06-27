import { ApiProperty } from '@nestjs/swagger';
import { NotBlank } from '@/common/decorator/validator';

export class RefreshTokensRequest {
  @NotBlank()
  @ApiProperty({ type: String, required: true, description: 'access token', example: 'fdsafasdfasdf1fdsdf3' })
  accessToken: string;

  @NotBlank()
  @ApiProperty({ type: String, required: true, description: 'refresh token', example: 'fdsafasdfasdf1fdsdf3' })
  refreshToken: string;
}
