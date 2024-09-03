import { PERFORMANCE_CATEGORY } from '@/performance/performance.entity';

export class PerformanceCounter {
  keyword: string | null;
  categories: PERFORMANCE_CATEGORY[];
  provinceIds: number[];
  isPreArranged: boolean;

  constructor({
    keyword,
    categories,
    provinceIds,
    isPreArranged,
  }: {
    keyword: string | null;
    categories: PERFORMANCE_CATEGORY[];
    provinceIds: number[];
    isPreArranged: boolean;
  }) {
    this.keyword = keyword;
    this.categories = categories;
    this.provinceIds = provinceIds;
    this.isPreArranged = isPreArranged;
  }
}
