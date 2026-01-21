import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';
import { NotBlank } from '@/common/decorator/validator';
import { ToNumberArray } from '@/common/decorator/transformer';
import { CreateInquiryCommand } from '@/system/dto/command/create-inquiry.command';

export class CreatePerformanceInquiryRequest {
  @NotBlank()
  @ApiProperty({ type: String, required: true, description: '이름', example: '아트인포' })
  name: string;

  @NotBlank()
  @ApiProperty({ type: String, required: true, description: '연락처', example: '010-4123-4123' })
  phone: string;

  @IsEmail()
  @NotBlank()
  @ApiProperty({ type: String, required: true, description: '이메일', example: 'artinfokorea@artinfokorea.com' })
  email: string;

  @ApiProperty({ type: String, required: true, description: '편성', example: '피아노 솔로' })
  ensembleType: string;

  @ToNumberArray()
  @ApiProperty({
    type: [Number],
    required: false,
    description: '행정 구역 아이디 목록',
    example: [1, 2],
  })
  provinceIds: number[] = [];

  @ApiProperty({ type: String, required: true, description: '내용', example: '공연 정보' })
  contents: string;

  toCommand(provinceNames: string[] = []) {
    const combinedContents = [
      `[이름] ${this.name}`,
      `[연락처] ${this.phone}`,
      `[편성] ${this.ensembleType}`,
      `[희망 지역] ${provinceNames.length > 0 ? provinceNames.join(', ') : '없음'}`,
      `[내용] ${this.contents}`,
    ].join('\n');

    return new CreateInquiryCommand({
      title: '기획 문의' + ' - ' + this.name,
      contents: combinedContents,
      email: this.email,
    });
  }
}
