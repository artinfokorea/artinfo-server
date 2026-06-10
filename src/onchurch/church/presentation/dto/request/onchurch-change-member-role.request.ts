import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';

export class OnchurchChangeMemberRoleRequest {
  @IsIn(['admin', 'member'])
  @ApiProperty({ type: String, enum: ['admin', 'member'], description: "변경할 등급 ('owner' 불가)" })
  role: 'admin' | 'member';
}
