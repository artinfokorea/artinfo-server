import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class OngiCreateInquiryRequest {
  @IsString({ message: '문의 내용을 입력해 주세요.' })
  @ApiProperty({ type: String, required: true, description: '문의 내용 (1~2000자)', example: '사진이 올라가지 않아요.' })
  content: string;
}
