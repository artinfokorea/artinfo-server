import { JOB_TYPE } from '@/job/entity/job.entity';

export class CountFullTimeJobsCommand {
  keyword: string | null;
  categoryIds: number[];
  types: JOB_TYPE[];
  provinceIds: number[];

  constructor({ keyword, categoryIds, types, provinceIds }: { keyword: string | null; categoryIds: number[]; types: JOB_TYPE[]; provinceIds: number[] }) {
    this.keyword = keyword;
    this.categoryIds = categoryIds;
    this.types = types;
    this.provinceIds = provinceIds;
  }
}
