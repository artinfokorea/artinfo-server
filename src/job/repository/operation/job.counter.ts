import { JOB_TYPE } from '@/job/entity/job.entity';

export class JobCounter {
  keyword: string | null;
  types: JOB_TYPE[];
  categoryIds: number[];
  provinceIds: number[];

  constructor({ keyword, types, categoryIds, provinceIds }: { keyword: string | null; types: JOB_TYPE[]; categoryIds: number[]; provinceIds: number[] }) {
    this.keyword = keyword;
    this.types = types;
    this.categoryIds = categoryIds;
    this.provinceIds = provinceIds;
  }
}
