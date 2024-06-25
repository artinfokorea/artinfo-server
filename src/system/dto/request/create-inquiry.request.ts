import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';
import { NotBlank } from '@/common/decorator/validator';
import { CreateInquiryCommand } from '@/system/dto/command/create-inquiry.command';

export class CreateInquiryRequest {
  @NotBlank()
  @ApiProperty({ type: String, required: true, description: '문의 제목', example: '문의합니다.' })
  title: string;

  @NotBlank()
  @ApiProperty({ type: String, required: true, description: '문의 내용', example: '광고 문의드립니다.' })
  contents: string;

  @IsEmail()
  @NotBlank()
  @ApiProperty({ type: String, required: true, description: '답변 받을 메일 주소', example: 'artinfokorea2022@gmail.com' })
  email: string;

  toCommand() {
    return new CreateInquiryCommand({
      title: this.title,
      contents: this.contents,
      email: this.email,
    });
  }
}
