import { ApiProperty } from '@nestjs/swagger';
export class CountLessonsResponse {
  @ApiProperty({ type: 'number', required: true, description: '레슨 개수', example: 2 })
  totalCount: number;

  constructor(totalCount: number) {
    this.totalCount = totalCount;
  }
}
