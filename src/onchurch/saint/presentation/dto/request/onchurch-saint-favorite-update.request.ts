import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class OnchurchSaintFavoriteUpdateRequest {
  @IsBoolean()
  @ApiProperty({ type: Boolean, required: true, description: '즐겨찾기 여부' })
  isFavorite: boolean;
}
