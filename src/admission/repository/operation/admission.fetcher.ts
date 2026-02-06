import { PagingOperation } from '@/common/type/operation';
import { Paging } from '@/common/type/type';
import { MAJOR_GROUP_CATEGORY } from '@/job/entity/major-category.entity';

export class AdmissionFetcher extends PagingOperation {
  keyword: string | null;
  year: number | null;
  majorCategoryIds: number[];
  majorGroups: MAJOR_GROUP_CATEGORY[];

  constructor({
    keyword,
    year,
    majorCategoryIds,
    majorGroups,
    paging,
  }: {
    keyword: string | null;
    year: number | null;
    majorCategoryIds: number[];
    majorGroups: MAJOR_GROUP_CATEGORY[];
    paging: Paging;
  }) {
    super({ page: paging.page, size: paging.size });
    this.keyword = keyword;
    this.year = year;
    this.majorCategoryIds = majorCategoryIds;
    this.majorGroups = majorGroups;
  }
}
