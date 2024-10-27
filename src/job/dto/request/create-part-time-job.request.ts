import { ApiProperty } from '@nestjs/swagger';
import { JOB_TYPE } from '@/job/entity/job.entity';
import { NotBlank, NumberArray } from '@/common/decorator/validator';
import { IsNumber } from 'class-validator';
import { CreatePartTimeJobCommand } from '@/job/dto/command/create-part-time-job.command';

export class CreateJobScheduleRequest {
  @ApiProperty({ type: Date, required: true, description: '일정 시작시간', example: new Date() })
  startAt: Date;

  @ApiProperty({ type: Date, required: true, description: '일정 종료시간', example: new Date() })
  endAt: Date;
}

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
  @ApiProperty({ type: 'string', required: true, description: '주소', example: '서울 서초구 방배동' })
  address: string;

  @NotBlank()
  @ApiProperty({ type: 'string', required: true, description: '단체 상세 주소', example: '401호' })
  addressDetail: string;

  @IsNumber()
  @NotBlank()
  @ApiProperty({ type: 'number', required: true, description: '페이', example: 50000 })
  fee: number;

  @NumberArray()
  @ApiProperty({ type: 'number[]', required: true, description: '전공 아이디 목록', example: [2, 3] })
  majorIds: number[];

  @ApiProperty({ type: [CreateJobScheduleRequest], required: true, description: '오브리 일정', example: [{ startAt: new Date(), endAt: new Date() }] })
  schedules: CreateJobScheduleRequest[];

  toCommand(userId: number) {
    return new CreatePartTimeJobCommand({
      userId: userId,
      title: this.title,
      contents: this.contents,
      companyName: this.companyName,
      recruitSiteUrl: null,
      imageUrl: null,
      address: this.address,
      addressDetail: this.addressDetail,
      fee: this.fee,
      majorIds: this.majorIds,
      type: JOB_TYPE.PART_TIME,
      schedules: this.schedules,
    });
  }
}
