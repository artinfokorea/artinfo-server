import { ApiProperty } from '@nestjs/swagger';

export class CreateExamResponse {
  @ApiProperty({ description: '생성된 시험 ID', example: '550e8400-e29b-41d4-a716-446655440000' })
  examId: string;

  constructor(examId: string) {
    this.examId = examId;
  }
}
