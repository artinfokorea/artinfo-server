import { Enum, NotBlank } from '@/common/decorator/validator';
import { ApiProperty } from '@nestjs/swagger';
import { SCHOOL_TYPE } from '@/user/entity/school.entity';

export class CreateSchoolRequest {
  @Enum(SCHOOL_TYPE)
  @NotBlank()
  @ApiProperty({ enum: SCHOOL_TYPE, enumName: 'SCHOOL_TYPE', required: true, description: '학력 타입', example: SCHOOL_TYPE.DOCTOR })
  type: SCHOOL_TYPE;

  @NotBlank()
  @ApiProperty({ type: 'string', required: true, description: '학교 이름', example: '총신대학교' })
  name: string;
}
