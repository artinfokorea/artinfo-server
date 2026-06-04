import { ApiProperty } from '@nestjs/swagger';
import { IsPhone, NotBlank } from '@/common/decorator/validator';
import { MaxLength } from 'class-validator';

export class OnchurchUpdateProfileRequest {
  @NotBlank()
  @MaxLength(40)
  @ApiProperty({ type: String, required: true, description: '이름', example: '홍길동' })
  name: string;

  @NotBlank()
  @IsPhone()
  @ApiProperty({ type: String, required: true, description: '휴대폰 번호 (010-XXXX-XXXX)', example: '010-1234-5678' })
  phone: string;
}
