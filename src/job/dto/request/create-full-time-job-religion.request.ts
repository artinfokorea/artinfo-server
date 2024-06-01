import { ApiProperty } from '@nestjs/swagger';
import { FULL_TIME_JOB_TYPE, PROVINCE_TYPE } from '@/job/entity/full-time-job.entity';
import { CreateFullTimeJobCommand } from '@/job/dto/command/create-full-time-job.command';
import { Enum, NotBlank } from '@/common/decorator/validator';
import { IsNumber } from 'class-validator';

export class CreateFullTimeJobReligionRequest {
  @NotBlank()
  @ApiProperty({ type: 'string', required: true, description: '채용 제목', example: '춘천시립예술단 단원 모집' })
  title: string;

  @NotBlank()
  @ApiProperty({ type: 'string', required: true, description: '채용 내용', example: '춘천시립예술단 단원 모집합니다' })
  contents: string;

  @NotBlank()
  @ApiProperty({ type: 'string', required: true, description: '단체명', example: '춘천시립예술단' })
  companyName: string;

  @Enum(PROVINCE_TYPE)
  @ApiProperty({ enum: PROVINCE_TYPE, enumName: 'PROVINCE_TYPE', required: true, description: '회사 지역 ( 예숧단체 등록시 NONE )', example: '서울' })
  province: PROVINCE_TYPE;

  @NotBlank()
  @ApiProperty({ type: 'string', required: true, description: '주소', example: '강원도 정선군 정선읍' })
  address: string;

  @IsNumber()
  @NotBlank()
  @ApiProperty({ type: 'number', required: true, description: '사례비', example: 500000 })
  fee: number;

  @IsNumber()
  @NotBlank()
  @ApiProperty({ type: 'number', required: true, description: '전공 아이디', example: 5 })
  majorId: number;

  toCommand(userId: number) {
    return new CreateFullTimeJobCommand({
      userId: userId,
      title: this.title,
      contents: this.contents,
      companyName: this.companyName,
      province: this.province,
      imageUrl: null,
      address: this.address,
      fee: this.fee,
      majorIds: [this.majorId],
      type: FULL_TIME_JOB_TYPE.RELIGION,
    });
  }
}
