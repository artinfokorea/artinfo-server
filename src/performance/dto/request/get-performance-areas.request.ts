import { ApiProperty } from '@nestjs/swagger';
import { List, Paging } from '@/common/type/type';
import { GetPerformanceAreasQuery } from '@/performance/dto/query/get-performance-areas.query';

export class GetPerformanceAreasRequest extends List {
  @ApiProperty({ type: String, required: true, description: '검색 키워드', example: '합창' })
  keyword: string;

  toQuery() {
    const paging: Paging = { page: this.page, size: this.size };

    return new GetPerformanceAreasQuery({
      keyword: this.keyword,
      paging: paging,
    });
  }
}
