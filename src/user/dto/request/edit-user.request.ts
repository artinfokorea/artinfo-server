import { IsPhone, NumberArray } from '@/common/decorator/validator';
import { ApiProperty } from '@nestjs/swagger';
import { CreateSchoolRequest } from '@/user/dto/request/create-school.request';
import { EditUserCommand } from '@/user/dto/command/edit-user.command';

export class EditUserRequest {
  @IsPhone()
  @ApiProperty({ type: 'string', required: false, description: '연락처', example: '010-4028-7451' })
  phone: string | null = null;

  @ApiProperty({ type: 'string', required: false, description: '아이콘 이미지 주소', example: 'https://artinfokorea.com' })
  iconImageUrl: string | null = null;

  @ApiProperty({ type: 'date | null', required: false, description: '생년월일', example: new Date() })
  birth: Date | null = null;

  @NumberArray()
  @ApiProperty({ type: 'number[]', required: false, description: '전공 아이디 목록', example: [1, 2, 3] })
  majorIds: number[] = [];

  @ApiProperty({ type: [CreateSchoolRequest], required: false, description: '학력 목록' })
  schools: CreateSchoolRequest[] = [];

  toEditUserCommand(userId: number) {
    return new EditUserCommand({
      schools: this.schools,
      userId: userId,
      phone: this.phone,
      birth: this.birth,
      majorIds: this.majorIds,
      iconImageUrl: this.iconImageUrl,
    });
  }
}
