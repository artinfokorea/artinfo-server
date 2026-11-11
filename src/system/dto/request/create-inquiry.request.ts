import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNumber, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
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

  /** 허니팟 — 화면에 안 보이는 칸. 사람은 비워 둔다 */
  @IsOptional()
  @IsString()
  @ApiProperty({ type: String, required: false, description: '(스팸 방지) 비워 두세요' })
  website?: string;

  /** 폼을 연 시각(epoch ms) — 3초 안에 제출하면 봇으로 본다 */
  @IsOptional()
  @Transform(({ value }) => (value === undefined || value === null || value === '' ? undefined : Number(value)))
  @IsNumber()
  @ApiProperty({ type: Number, required: false, description: '(스팸 방지) 폼을 연 시각 epoch ms' })
  startedAt?: number;

  toCommand() {
    return new CreateInquiryCommand({
      title: this.title,
      contents: this.contents,
      email: this.email,
    });
  }
}
