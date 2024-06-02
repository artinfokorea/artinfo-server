import { ApiProperty } from '@nestjs/swagger';
import { PROVINCE_TYPE } from '@/job/entity/job.entity';
import { NotBlank, NumberArray } from '@/common/decorator/validator';
import { IsNumber } from 'class-validator';
import { EditFullTimeJobCommand } from '@/job/dto/command/edit-full-time-job.command';

export class EditJobArtOrganizationRequest {
  @IsNumber()
  @NotBlank()
  @ApiProperty({ type: 'number', required: true, description: '채용 아이디', example: 5 })
  jobId: number;

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
    return new EditFullTimeJobCommand({
      jobId: this.jobId,
      userId: userId,
      title: this.title,
      contents: this.contents,
      companyName: this.companyName,
      province: PROVINCE_TYPE.NONE,
      imageUrl: this.imageUrl,
      address: null,
      fee: null,
      majorIds: this.majorIds,
    });
  }
}
