import { ApiProperty } from '@nestjs/swagger';
import { School, SCHOOL_TYPE } from '@/user/entity/school.entity';

export class LessonSchoolResponse {
  @ApiProperty({ type: 'number', required: true, description: '학력 아이디', example: 5 })
  id: number;

  @ApiProperty({ enum: SCHOOL_TYPE, enumName: 'SCHOOL_TYPE', required: true, description: '학력 타입', example: SCHOOL_TYPE.DOCTOR })
  type: SCHOOL_TYPE;

  @ApiProperty({ type: 'string', required: true, description: '학교 이름', example: '서울대학교' })
  name: string;

  constructor(school: School) {
    this.id = school.id;
    this.type = school.type;
    this.name = school.name;
  }
}
