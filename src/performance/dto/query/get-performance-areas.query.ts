import { Paging } from '@/common/type/type';
import { PerformanceAreaFetcher } from '@/performance/repository/operation/performance-area.fetcher';
import { PerformanceAreaCounter } from '@/performance/repository/operation/performance-area.counter';

export class GetPerformanceAreasQuery {
  keyword: string;
  paging: Paging;

  constructor({ keyword, paging }: { keyword: string; paging: Paging }) {
    this.paging = paging;
    this.keyword = keyword;
  }

  toFetcher() {
    return new PerformanceAreaFetcher({
      keyword: this.keyword,
      paging: this.paging,
    });
  }

  toCounter() {
    return new PerformanceAreaCounter({
      keyword: this.keyword,
    });
  }
}
