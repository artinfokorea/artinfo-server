import { JOB_TYPE } from '@/job/entity/job.entity';
import { PROVINCE_TYPE } from '@/system/entity/province';

export class JobCounter {
  keyword: string | null;
  types: JOB_TYPE[];
  categoryIds: number[];
  province: PROVINCE_TYPE[];

  constructor({ keyword, types, categoryIds, province }: { keyword: string | null; types: JOB_TYPE[]; categoryIds: number[]; province: PROVINCE_TYPE[] }) {
    this.keyword = keyword;
    this.types = types;
    this.categoryIds = categoryIds;
    this.province = province;
  }
}
