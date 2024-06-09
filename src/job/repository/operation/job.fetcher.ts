import { JOB_TYPE } from '@/job/entity/job.entity';
import { PagingOperation } from '@/common/type/operation';
import { Paging } from '@/common/type/type';
import { PROVINCE_TYPE } from '@/system/entity/province';

export class JobFetcher extends PagingOperation {
  keyword: string | null;
  types: JOB_TYPE[];
  categoryIds: number[];
  province: PROVINCE_TYPE[];

  constructor({
    keyword,
    types,
    categoryIds,
    paging,
    province,
  }: {
    keyword: string | null;
    types: JOB_TYPE[];
    categoryIds: number[];
    paging: Paging;
    province: PROVINCE_TYPE[];
  }) {
    super({ page: paging.page, size: paging.size });
    this.keyword = keyword;
    this.types = types;
    this.categoryIds = categoryIds;
    this.province = province;
  }
}
