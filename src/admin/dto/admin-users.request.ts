import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { USER_TYPE } from '@/user/entity/user.entity';

export class UpdateAdminUserTypeRequest {
  @IsEnum(USER_TYPE)
  @ApiProperty({ enum: USER_TYPE, required: true, description: '바꿀 역할 — ADMIN(관리자) / CLIENT(일반 회원)', example: 'ADMIN' })
  type: USER_TYPE;
}
