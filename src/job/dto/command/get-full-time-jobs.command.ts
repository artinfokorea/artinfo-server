import { Paging } from '@/common/type/type';
import { JOB_TYPE } from '@/job/entity/job.entity';
import { PROVINCE_TYPE } from '@/system/entity/province';

export class GetFullTimeJobsCommand {
  keyword: string | null;
  paging: Paging;
  categoryIds: number[];
  types: JOB_TYPE[];
  province: PROVINCE_TYPE[];

  constructor({
    keyword,
    paging,
    categoryIds,
    types,
    province,
  }: {
    keyword: string | null;
    paging: Paging;
    categoryIds: number[];
    types: JOB_TYPE[];
    province: PROVINCE_TYPE[];
  }) {
    this.keyword = keyword;
    this.paging = paging;
    this.categoryIds = categoryIds;
    this.types = types;
    this.province = province;
  }
}
