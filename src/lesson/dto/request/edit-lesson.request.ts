import { ApiProperty } from '@nestjs/swagger';
import { EditLessonCommand } from '@/lesson/dto/command/edit-lesson.command';
import { IsArrayLength } from '@/common/decorator/validator';

export class EditLessonRequest {
  @ApiProperty({ type: 'string', required: true, description: '레슨 대표 이미지', example: 'https://update.artinfokorea.com' })
  imageUrl: string;

  @ApiProperty({ type: 'number', required: true, description: '레슨 사례비', example: 60000 })
  pay: number;

  @IsArrayLength(1, 3)
  @ApiProperty({ type: 'string', required: true, description: '레슨 가능 지역', example: ['서울 서초구'] })
  areas: string[] = [];

  @ApiProperty({ type: 'string', required: true, description: '강사 소개', example: '수정 안녕하세요' })
  introduction: string;

  @ApiProperty({ type: 'string | null', required: false, description: '강사 경력', example: '수정 정선 콩쿨 1등' })
  career: string | null;

  toCommand(userId: number) {
    return new EditLessonCommand({
      userId: userId,
      imageUrl: this.imageUrl,
      pay: this.pay,
      areaNames: this.areas,
      introduction: this.introduction,
      career: this.career,
    });
  }
}
