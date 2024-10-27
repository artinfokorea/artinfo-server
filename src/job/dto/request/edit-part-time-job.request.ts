import { ApiProperty } from '@nestjs/swagger';
import { NotBlank, NumberArray } from '@/common/decorator/validator';
import { EditJobCommand } from '@/job/dto/command/edit-job.command';
import { IsBoolean, IsNumber } from 'class-validator';
import { CreateJobScheduleRequest } from '@/job/dto/request/create-part-time-job.request';

export class EditPartTimeJobRequest {
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
  @ApiProperty({ type: 'string', required: true, description: '단체 주소', example: '서울 서초구 방배동' })
  address: string;

  @NotBlank()
  @ApiProperty({ type: 'string', required: true, description: '단체 상세 주소', example: '401호' })
  addressDetail: string;

  @IsNumber()
  @NotBlank()
  @ApiProperty({ type: 'number', required: true, description: '페이', example: 50000 })
  fee: number;

  @NumberArray()
  @ApiProperty({ type: 'number[]', required: true, description: '전공 아이디 목록', example: [5, 6] })
  majorIds: number[];

  @IsBoolean()
  @ApiProperty({ type: 'boolean', required: true, description: '활성화 여부', example: true })
  isActive: boolean;

  @ApiProperty({ type: [CreateJobScheduleRequest], required: true, description: '오브리 일정', example: [{ startAt: new Date(), endAt: new Date() }] })
  schedules: CreateJobScheduleRequest[];

  toCommand(userId: number, jobId: number) {
    return new EditJobCommand({
      jobId: jobId,
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
      schedules: this.schedules,
      isActive: this.isActive,
    });
  }
}
