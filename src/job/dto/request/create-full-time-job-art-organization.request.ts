import { ApiProperty } from '@nestjs/swagger';
import { FULL_TIME_JOB_TYPE, PROVINCE_TYPE } from '@/job/entity/full-time-job.entity';
import { CreateFullTimeJobCommand } from '@/job/dto/command/create-full-time-job.command';
import { NotBlank, NumberArray } from '@/common/decorator/validator';

export class CreateFullTimeJobArtOrganizationRequest {
  @NotBlank()
  @ApiProperty({ type: 'string', required: true, description: '채용 제목', example: '춘천시립예술단 단원 모집' })
  title: string;

  @NotBlank()
  @ApiProperty({ type: 'string', required: true, description: '채용 내용', example: '춘천시립예술단 단원 모집합니다' })
  contents: string;

  @NotBlank()
  @ApiProperty({ type: 'string', required: true, description: '단체명', example: '춘천시립예술단' })
  companyName: string;

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
      province: PROVINCE_TYPE.NONE,
      imageUrl: this.imageUrl,
      address: null,
      fee: null,
      majorIds: this.majorIds,
      type: FULL_TIME_JOB_TYPE.ART_ORGANIZATION,
    });
  }
}
