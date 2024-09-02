import { PagingOperation } from '@/common/type/operation';
import { Paging } from '@/common/type/type';

export class PerformanceAreaFetcher extends PagingOperation {
  keyword: string;

  constructor({ keyword, paging }: { keyword: string; paging: Paging }) {
    super({ page: paging.page, size: paging.size });
    this.keyword = keyword;
  }
}
