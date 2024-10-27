import { Paging } from '@/common/type/type';
import { MAJOR_GROUP_CATEGORY } from '@/job/entity/major-category.entity';

export class GetPartTimeJobsQuery {
  keyword: string | null;
  paging: Paging;
  majorGroups: MAJOR_GROUP_CATEGORY[];
  provinceIds: number[];

  constructor({
    keyword,
    paging,
    majorGroups,
    provinceIds,
  }: {
    keyword: string | null;
    paging: Paging;
    majorGroups: MAJOR_GROUP_CATEGORY[];
    provinceIds: number[];
  }) {
    this.keyword = keyword;
    this.paging = paging;
    this.majorGroups = majorGroups;
    this.provinceIds = provinceIds;
  }
}
