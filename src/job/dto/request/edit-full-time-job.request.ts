import { ApiProperty } from '@nestjs/swagger';
import { NotBlank, NumberArray } from '@/common/decorator/validator';
import { EditJobCommand } from '@/job/dto/command/edit-job.command';

export class EditFullTimeJobRequest {
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

  @ApiProperty({ type: 'string', required: false, description: '자사 채용 사이트 주소', example: 'https://artinfokorea.com' })
  recruitSiteUrl: string | null = null;

  @ApiProperty({ type: 'string', required: false, description: '회사 대표 이미지', example: 'https://artinfokorea.com' })
  imageUrl: string | null = null;

  @NumberArray()
  @ApiProperty({ type: 'number[]', required: true, description: '전공 아이디 목록', example: [5, 6] })
  majorIds: number[];

  toCommand(userId: number, jobId: number) {
    return new EditJobCommand({
      jobId: jobId,
      userId: userId,
      title: this.title,
      contents: this.contents,
      companyName: this.companyName,
      recruitSiteUrl: this.recruitSiteUrl,
      imageUrl: this.imageUrl,
      address: this.address,
      addressDetail: this.addressDetail,
      fee: null,
      majorIds: this.majorIds,
    });
  }
}
