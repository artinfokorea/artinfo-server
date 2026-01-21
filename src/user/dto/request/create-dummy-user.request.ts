import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateDummyUserRequest {
  @IsString()
  @ApiProperty({ type: String, required: true, description: '사용자 닉네임', example: '더미유저' })
  nickname: string;
}
