import { List, Paging } from '@/common/type/type';
import { ApiProperty } from '@nestjs/swagger';
import { GetNewsListCommand } from '@/news/dto/command/get-news-list.command';

export class GetNewsListRequest extends List {
  @ApiProperty({ type: String, required: false, description: '검색 키워드', example: '합창' })
  keyword: string | null = null;

  toCommand() {
    const paging: Paging = { page: this.page, size: this.size };
    return new GetNewsListCommand({ keyword: this.keyword, paging: paging });
  }
}
