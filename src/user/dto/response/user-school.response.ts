import { ApiProperty } from '@nestjs/swagger';
import { SCHOOL_TYPE } from '@/user/entity/school.entity';

export class UserSchoolResponse {
  @ApiProperty({ type: 'number', required: true, description: '학력 아이디', example: 5 })
  id: number;

  @ApiProperty({ enum: SCHOOL_TYPE, enumName: 'SCHOOL_TYPE', required: true, description: '학력 타입', example: SCHOOL_TYPE.DOCTOR })
  type: SCHOOL_TYPE;

  @ApiProperty({ type: 'string', required: true, description: '학교 이름', example: '서울대학교' })
  name: string;

  constructor({ id, type, name }: { id: number; type: SCHOOL_TYPE; name: string }) {
    this.id = id;
    this.type = type;
    this.name = name;
  }
}
