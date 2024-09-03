import { PERFORMANCE_CATEGORY } from '@/performance/performance.entity';
import { Paging } from '@/common/type/type';
import { PerformanceFetcher } from '@/performance/repository/operation/performance.fetcher';
import { PerformanceCounter } from '@/performance/repository/operation/performance.counter';

export class GetPerformancesQuery {
  keyword: string | null;
  categories: PERFORMANCE_CATEGORY[];
  provinceIds: number[];
  paging: Paging;

  constructor({
    keyword,
    categories,
    paging,
    provinceIds,
  }: {
    keyword: string | null;
    categories: PERFORMANCE_CATEGORY[];
    paging: Paging;
    provinceIds: number[];
  }) {
    this.paging = paging;
    this.keyword = keyword;
    this.categories = categories;
    this.provinceIds = provinceIds;
  }

  toFetcher() {
    return new PerformanceFetcher({
      keyword: this.keyword,
      categories: this.categories,
      provinceIds: this.provinceIds,
      paging: this.paging,
    });
  }

  toCounter() {
    return new PerformanceCounter({
      keyword: this.keyword,
      categories: this.categories,
      provinceIds: this.provinceIds,
      isPreArranged: false,
    });
  }
}
