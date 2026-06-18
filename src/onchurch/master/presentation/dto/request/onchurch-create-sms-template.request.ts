import { ApiProperty } from '@nestjs/swagger';
import { MaxLength } from 'class-validator';
import { NotBlank } from '@/common/decorator/validator';

export class OnchurchCreateSmsTemplateRequest {
  @NotBlank()
  @MaxLength(100)
  @ApiProperty({ type: String, required: true, description: '템플릿 이름' })
  name: string;

  @NotBlank()
  @MaxLength(40)
  @ApiProperty({ type: String, required: true, description: '문자 제목' })
  subject: string;

  @NotBlank()
  @MaxLength(2000)
  @ApiProperty({ type: String, required: true, description: '문자 본문' })
  content: string;
}
