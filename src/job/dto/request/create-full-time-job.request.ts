import { ApiProperty } from '@nestjs/swagger';
import { JOB_TYPE, PROVINCE_TYPE } from '@/job/entity/job.entity';
import { CreateFullTimeJobCommand } from '@/job/dto/command/create-full-time-job.command';
import { Enum, NotBlank, NumberArray } from '@/common/decorator/validator';

export class CreateFullTimeJobRequest {
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

  @ApiProperty({ type: 'string', required: false, description: '회사 대표 이미지', example: 'https://artinfokorea.com' })
  imageUrl: string | null = null;

  @NumberArray()
  @ApiProperty({ type: 'number[]', required: true, description: '전공 아이디 목록', example: [5, 6] })
  majorIds: number[];

  toCommand(userId: number) {
    return new CreateFullTimeJobCommand({
      userId: userId,
      title: this.title,
      contents: this.contents,
      companyName: this.companyName,
      province: this.province,
      imageUrl: this.imageUrl,
      address: null,
      fee: null,
      majorIds: this.majorIds,
      type: JOB_TYPE.ART_ORGANIZATION,
      startAt: null,
      endAt: null,
    });
  }
}
