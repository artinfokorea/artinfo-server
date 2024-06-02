import { ApiProperty } from '@nestjs/swagger';
import { User } from '@/user/entity/user.entity';

export class UserResponse {
  @ApiProperty({ type: 'number', required: true, description: '유저 아이디', example: 5 })
  id: number;

  @ApiProperty({ type: 'string', required: true, description: '유저 이름', example: '임성준' })
  name: string;

  @ApiProperty({ type: 'string', required: true, description: '유저 이메일', example: 'artinfokorea@gmail.com' })
  email: string;

  constructor(user: User) {
    this.id = user.id;
    this.name = user.name;
    this.email = user.email;
  }
}
