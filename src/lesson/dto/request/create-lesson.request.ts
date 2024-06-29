import { ApiProperty } from '@nestjs/swagger';
import { CreateLessonCommand } from '@/lesson/dto/command/create-lesson.command';
import { IsArrayLength } from '@/common/decorator/validator';

export class CreateLessonRequest {
  @ApiProperty({ type: 'string', required: true, description: '레슨 대표 이미지', example: 'https://artinfokorea.com' })
  imageUrl: string;

  @ApiProperty({ type: 'number', required: true, description: '레슨 사례비', example: 50000 })
  pay: number;

  @IsArrayLength(1, 3)
  @ApiProperty({ type: 'string', required: true, description: '레슨 가능 지역', example: ['강원특별시 정선군'] })
  areas: string[] = [];

  @ApiProperty({ type: 'string', required: true, description: '강사 소개', example: '안녕하세요' })
  introduction: string;

  @ApiProperty({ type: 'string', required: true, description: '강사 경력', example: '정선 콩쿨 1등' })
  career: string;

  toCommand(userId: number) {
    return new CreateLessonCommand({
      userId: userId,
      imageUrl: this.imageUrl,
      pay: this.pay,
      areaNames: this.areas,
      introduction: this.introduction,
      career: this.career,
    });
  }
}
