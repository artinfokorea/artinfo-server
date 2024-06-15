import { PagingOperation } from '@/common/type/operation';
import { Paging } from '@/common/type/type';

export class LessonFetcher extends PagingOperation {
  keyword: string | null;
  majorIds: number[];
  provinceIds: number[];

  constructor({ keyword, majorIds, provinceIds, paging }: { keyword: string | null; majorIds: number[]; provinceIds: number[]; paging: Paging }) {
    super({ page: paging.page, size: paging.size });
    this.keyword = keyword;
    this.majorIds = majorIds;
    this.provinceIds = provinceIds;
  }
}
