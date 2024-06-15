import { List, Paging } from '@/common/type/type';
import { ApiProperty } from '@nestjs/swagger';
import { GetLessonsCommand } from '@/lesson/dto/command/get-lessons.command';
import { CountLessonsCommand } from '@/lesson/dto/command/count-lessons.command';
import { ToNumberArray } from '@/common/decorator/transformer';

export class GetLessonsRequest extends List {
  @ApiProperty({ type: String, required: false, description: '검색 키워드', example: '합창' })
  keyword: string | null = null;

  @ToNumberArray()
  @ApiProperty({ type: [Number], required: false, description: '전공 아이디 목록', example: [1, 2] })
  majorIds: number[] = [];

  @ToNumberArray()
  @ApiProperty({ type: [Number], required: false, description: '지역 아이디 목록', example: [1, 2] })
  provinceIds: number[] = [];

  toGetCommand() {
    const paging: Paging = { page: this.page, size: this.size };
    return new GetLessonsCommand({ keyword: this.keyword, majorIds: this.majorIds, provinceIds: this.provinceIds, paging: paging });
  }

  toCountCommand() {
    return new CountLessonsCommand({ keyword: this.keyword, majorIds: this.majorIds, provinceIds: this.provinceIds });
  }
}
