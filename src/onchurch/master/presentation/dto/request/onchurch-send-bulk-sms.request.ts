import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsString, MaxLength } from 'class-validator';
import { NotBlank } from '@/common/decorator/validator';

export class OnchurchSendBulkSmsRequest {
  @NotBlank()
  @MaxLength(40)
  @ApiProperty({ type: String, required: true, description: '문자 제목 (LMS 제목)' })
  subject: string;

  // 정확한 2000바이트 검증은 usecase에서 수행한다. 여기서는 글자 수 상한만 둔다.
  @NotBlank()
  @MaxLength(2000)
  @ApiProperty({ type: String, required: true, description: '문자 본문 (최대 2000바이트)' })
  content: string;

  @IsArray()
  @ArrayNotEmpty({ message: '수신자를 1명 이상 입력해주세요.' })
  @IsString({ each: true })
  @ApiProperty({ type: [String], required: true, description: '수신자 휴대폰 번호 목록' })
  recipients: string[];
}
