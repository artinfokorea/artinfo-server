import { PERFORMANCE_CATEGORY } from '@/performance/performance.entity';
import { PagingOperation } from '@/common/type/operation';
import { Paging } from '@/common/type/type';

export class PerformanceFetcher extends PagingOperation {
  keyword: string | null;
  categories: PERFORMANCE_CATEGORY[];
  provinceIds: number[];

  constructor({
    keyword,
    categories,
    provinceIds,
    paging,
  }: {
    keyword: string | null;
    categories: PERFORMANCE_CATEGORY[];
    provinceIds: number[];
    paging: Paging;
  }) {
    super({ page: paging.page, size: paging.size });
    this.keyword = keyword;
    this.categories = categories;
    this.provinceIds = provinceIds;
  }
}
