import { ApiProperty } from '@nestjs/swagger';
import { NotBlank } from '@/common/decorator/validator';
import { IsNumber } from 'class-validator';
import { EditFullTimeJobCommand } from '@/job/dto/command/edit-full-time-job.command';

export class EditJobReligionRequest {
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
    return new EditFullTimeJobCommand({
      jobId: this.jobId,
      userId: userId,
      title: this.title,
      contents: this.contents,
      companyName: this.companyName,
      imageUrl: null,
      address: this.address,
      fee: this.fee,
      majorIds: [this.majorId],
    });
  }
}
