import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive } from 'class-validator';

export class OnchurchTransferChurchOwnerRequest {
  @IsInt()
  @IsPositive()
  @ApiProperty({ type: Number, description: '새 소유자가 될 사용자 ID' })
  userId: number;
}
