import { ApiProperty } from '@nestjs/swagger';
import { MaxLength } from 'class-validator';
import { NotBlank } from '@/common/decorator/validator';

export class OnchurchInquiryWriteRequest {
  @NotBlank()
  @MaxLength(5000)
  @ApiProperty({ type: String, required: true, description: '문의 내용' })
  question: string;
}
