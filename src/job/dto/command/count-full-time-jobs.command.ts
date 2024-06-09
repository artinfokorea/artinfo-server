import { JOB_TYPE } from '@/job/entity/job.entity';
import { PROVINCE_TYPE } from '@/system/entity/province';

export class CountFullTimeJobsCommand {
  keyword: string | null;
  categoryIds: number[];
  types: JOB_TYPE[];
  province: PROVINCE_TYPE[];

  constructor({ keyword, categoryIds, types, province }: { keyword: string | null; categoryIds: number[]; types: JOB_TYPE[]; province: PROVINCE_TYPE[] }) {
    this.keyword = keyword;
    this.categoryIds = categoryIds;
    this.types = types;
    this.province = province;
  }
}
