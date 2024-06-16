import { ApiProperty } from '@nestjs/swagger';
import { JOB_TYPE } from '@/job/entity/job.entity';
import { CreateJobCommand } from '@/job/dto/command/create-job.command';
import { NotBlank } from '@/common/decorator/validator';
import { IsNumber } from 'class-validator';

export class CreateJobReligionRequest {
  @NotBlank()
  @ApiProperty({ type: 'string', required: true, description: '채용 제목', example: '대전 중부교회 남성 솔리스트' })
  title: string;

  @NotBlank()
  @ApiProperty({ type: 'string', required: true, description: '채용 내용', example: '중부교회 솔리스트 모집합니다.' })
  contents: string;

  @NotBlank()
  @ApiProperty({ type: 'string', required: true, description: '단체명', example: '대전 중부교회' })
  companyName: string;

  @NotBlank()
  @ApiProperty({ type: 'string', required: true, description: '주소', example: '동구 동서대로 1748번길 40' })
  address: string;

  @IsNumber()
  @NotBlank()
  @ApiProperty({ type: 'number', required: true, description: '사례비', example: 250000 })
  fee: number;

  @IsNumber()
  @NotBlank()
  @ApiProperty({ type: 'number', required: true, description: '전공 아이디', example: 3 })
  majorId: number;

  toCommand(userId: number) {
    return new CreateJobCommand({
      userId: userId,
      title: this.title,
      contents: this.contents,
      companyName: this.companyName,
      imageUrl: null,
      address: this.address,
      fee: this.fee,
      majorIds: [this.majorId],
      type: JOB_TYPE.RELIGION,
      startAt: null,
      endAt: null,
    });
  }
}
