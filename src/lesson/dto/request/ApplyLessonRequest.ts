import { ApiProperty } from '@nestjs/swagger';
import { ApplyLessonCommand } from '@/lesson/dto/command/ApplyLessonCommand';

export class ApplyLessonRequest {
  @ApiProperty({ type: Number, required: true, description: '레슨 선생님 아이디', example: 5 })
  teacherId: number;

  @ApiProperty({ type: String, required: true, description: '신청 내용', example: '안녕하세요' })
  contents: string;

  toCommand(userId: number) {
    return new ApplyLessonCommand({
      applicantId: userId,
      teacherId: this.teacherId,
      contents: this.contents,
    });
  }
}
