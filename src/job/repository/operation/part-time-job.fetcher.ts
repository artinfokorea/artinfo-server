import { PagingOperation } from '@/common/type/operation';
import { MAJOR_GROUP_CATEGORY } from '@/job/entity/major-category.entity';
import { Paging } from '@/common/type/type';

export class PartTimeJobFetcher extends PagingOperation {
  keyword: string | null;
  majorGroup: MAJOR_GROUP_CATEGORY[];
  provinceIds: number[];

  constructor({
    keyword,
    majorGroup,
    provinceIds,
    paging,
  }: {
    paging: Paging;
    keyword: string | null;
    majorGroup: MAJOR_GROUP_CATEGORY[];
    provinceIds: number[];
  }) {
    super({ page: paging.page, size: paging.size });
    this.majorGroup = majorGroup;
    this.keyword = keyword;
    this.provinceIds = provinceIds;
  }
}
