import { Paging } from '@/common/type/type';
import { JOB_TYPE } from '@/job/entity/job.entity';

export class GetJobsCommand {
  keyword: string | null;
  paging: Paging;
  categoryIds: number[];
  types: JOB_TYPE[];
  provinceIds: number[];

  constructor({
    keyword,
    paging,
    categoryIds,
    types,
    provinceIds,
  }: {
    keyword: string | null;
    paging: Paging;
    categoryIds: number[];
    types: JOB_TYPE[];
    provinceIds: number[];
  }) {
    this.keyword = keyword;
    this.paging = paging;
    this.categoryIds = categoryIds;
    this.types = types;
    this.provinceIds = provinceIds;
  }
}
