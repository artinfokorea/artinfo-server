import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsString, MaxLength } from 'class-validator';
import { NotBlank } from '@/common/decorator/validator';

export class OnchurchSendBulkEmailRequest {
  @NotBlank()
  @MaxLength(200)
  @ApiProperty({ type: String, required: true, description: '메일 제목' })
  subject: string;

  @NotBlank()
  @MaxLength(50000)
  @ApiProperty({ type: String, required: true, description: '메일 본문 (줄바꿈은 <br>로 변환되어 발송)' })
  content: string;

  @IsArray()
  @ArrayNotEmpty({ message: '수신자를 1명 이상 입력해주세요.' })
  @IsString({ each: true })
  @ApiProperty({ type: [String], required: true, description: '수신자 이메일 목록' })
  recipients: string[];
}
