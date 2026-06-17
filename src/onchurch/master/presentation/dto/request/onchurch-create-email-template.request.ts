import { ApiProperty } from '@nestjs/swagger';
import { MaxLength } from 'class-validator';
import { NotBlank } from '@/common/decorator/validator';

export class OnchurchCreateEmailTemplateRequest {
  @NotBlank()
  @MaxLength(100)
  @ApiProperty({ type: String, required: true, description: '템플릿 이름' })
  name: string;

  @NotBlank()
  @MaxLength(200)
  @ApiProperty({ type: String, required: true, description: '메일 제목' })
  subject: string;

  @NotBlank()
  @MaxLength(50000)
  @ApiProperty({ type: String, required: true, description: '메일 본문' })
  content: string;
}
