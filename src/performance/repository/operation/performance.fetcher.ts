import { PagingOperation } from '@/common/type/operation';
import { PERFORMANCE_CATEGORY } from '@/performance/performance.entity';
import { Paging } from '@/common/type/type';

export class PerformanceFetcher extends PagingOperation {
  keyword: string | null;
  categories: PERFORMANCE_CATEGORY[];
  provinceIds: number[];

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
    super({ page: paging.page, size: paging.size });
    this.keyword = keyword;
    this.categories = categories;
    this.provinceIds = provinceIds;
  }
}
