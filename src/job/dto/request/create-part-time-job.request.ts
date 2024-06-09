import { ApiProperty } from '@nestjs/swagger';
import { JOB_TYPE } from '@/job/entity/job.entity';
import { CreateFullTimeJobCommand } from '@/job/dto/command/create-full-time-job.command';
import { NotBlank } from '@/common/decorator/validator';
import { IsNumber } from 'class-validator';

export class CreatePartTimeJobRequest {
  @NotBlank()
  @ApiProperty({ type: 'string', required: true, description: '채용 제목', example: '교회 11시예배 대타' })
  title: string;

  @NotBlank()
  @ApiProperty({ type: 'string', required: true, description: '채용 내용', example: '대타 구합니다~ 간략한프로필(성함,나이,학력)과 함께 문자로 연락주세요 😄' })
  contents: string;

  @NotBlank()
  @ApiProperty({ type: 'string', required: true, description: '단체명', example: '응암교회' })
  companyName: string;

  @NotBlank()
  @ApiProperty({ type: 'string', required: true, description: '주소', example: '응암역 응암교회' })
  address: string;

  @IsNumber()
  @ApiProperty({ type: 'number', required: true, description: '전공 아이디', example: 2 })
  majorId: number;

  @NotBlank()
  @ApiProperty({ type: 'date', required: true, description: '시작 시간', example: new Date() })
  startAt: Date;

  @NotBlank()
  @ApiProperty({ type: 'date', required: true, description: '종료 시간', example: new Date() })
  endAt: Date;

  toCommand(userId: number) {
    return new CreateFullTimeJobCommand({
      userId: userId,
      title: this.title,
      contents: this.contents,
      companyName: this.companyName,
      imageUrl: null,
      address: null,
      fee: null,
      majorIds: [this.majorId],
      type: JOB_TYPE.PART_TIME,
      startAt: this.startAt,
      endAt: this.endAt,
    });
  }
}
