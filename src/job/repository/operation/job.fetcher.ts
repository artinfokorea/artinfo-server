import { JOB_TYPE } from '@/job/entity/job.entity';
import { PagingOperation } from '@/common/type/operation';
import { Paging } from '@/common/type/type';

export class JobFetcher extends PagingOperation {
  keyword: string | null;
  types: JOB_TYPE[];
  categoryIds: number[];
  provinceIds: number[];

  constructor({
    keyword,
    types,
    categoryIds,
    paging,
    provinceIds,
  }: {
    keyword: string | null;
    types: JOB_TYPE[];
    categoryIds: number[];
    paging: Paging;
    provinceIds: number[];
  }) {
    super({ page: paging.page, size: paging.size });
    this.keyword = keyword;
    this.types = types;
    this.categoryIds = categoryIds;
    this.provinceIds = provinceIds;
  }
}
