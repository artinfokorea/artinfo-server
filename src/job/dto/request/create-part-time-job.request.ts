import { ApiProperty } from '@nestjs/swagger';
import { JOB_TYPE, PROVINCE_TYPE } from '@/job/entity/job.entity';
import { CreateFullTimeJobCommand } from '@/job/dto/command/create-full-time-job.command';
import { NotBlank } from '@/common/decorator/validator';
import { IsNumber } from 'class-validator';

export class CreatePartTimeJobRequest {
  @NotBlank()
  @ApiProperty({ type: 'string', required: true, description: '채용 제목', example: '춘천시립예술단 단원 모집' })
  title: string;

  @NotBlank()
  @ApiProperty({ type: 'string', required: true, description: '채용 내용', example: '춘천시립예술단 단원 모집합니다' })
  contents: string;

  @NotBlank()
  @ApiProperty({ type: 'string', required: true, description: '단체명', example: '춘천시립예술단' })
  companyName: string;

  @NotBlank()
  @ApiProperty({ type: 'string', required: true, description: '주소', example: '강원도 정선군 정선읍' })
  address: string;

  @IsNumber()
  @ApiProperty({ type: 'number', required: true, description: '전공 아이디', example: 5 })
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
      province: PROVINCE_TYPE.NONE,
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
