import { List, Paging } from '@/common/type/type';
import { ApiProperty } from '@nestjs/swagger';
import { GetLessonsCommand } from '@/lesson/dto/command/get-lessons.command';
import { CountLessonsCommand } from '@/lesson/dto/command/count-lessons.command';

export class GetLessonsRequest extends List {
  @ApiProperty({ type: String, required: false, description: '검색 키워드', example: '합창' })
  keyword: string | null = null;

  toGetCommand() {
    const paging: Paging = { page: this.page, size: this.size };
    return new GetLessonsCommand({ keyword: this.keyword, paging: paging });
  }

  toCountCommand() {
    return new CountLessonsCommand(this.keyword);
  }
}
