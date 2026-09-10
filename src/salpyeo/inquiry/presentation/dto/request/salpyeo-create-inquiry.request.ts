import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class SalpyeoCreateInquiryRequest {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @ApiProperty({ type: String, required: true, description: '제목', example: '요금 정보가 실제와 달라요' })
  title: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  @ApiProperty({ type: String, required: true, description: '문의 내용', example: '올리비움산후조리원 2주 요금이 홈페이지와 다릅니다.' })
  content: string;

  @IsEmail({}, { message: '이메일 형식이 올바르지 않습니다.' })
  @MaxLength(200)
  @ApiProperty({ type: String, required: true, description: '답변받을 이메일', example: 'mom@example.com' })
  email: string;
}
