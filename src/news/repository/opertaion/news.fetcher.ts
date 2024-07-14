import { PagingOperation } from '@/common/type/operation';
import { Paging } from '@/common/type/type';

export class NewsFetcher extends PagingOperation {
  keyword: string | null;

  constructor({ keyword, paging }: { keyword: string | null; paging: Paging }) {
    super({ page: paging.page, size: paging.size });
    this.keyword = keyword;
  }
}
