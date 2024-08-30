import { PERFORMANCE_CATEGORY } from '@/performance/performance.entity';

export class PerformanceCounter {
  keyword: string | null;
  categories: PERFORMANCE_CATEGORY[];
  provinceIds: number[];

  constructor({ keyword, categories, provinceIds }: { keyword: string | null; categories: PERFORMANCE_CATEGORY[]; provinceIds: number[] }) {
    this.keyword = keyword;
    this.categories = categories;
    this.provinceIds = provinceIds;
  }
}
