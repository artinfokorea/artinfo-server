import { JOB_TYPE } from '@/job/entity/job.entity';

export class CountFullTimeJobsCommand {
  keyword: string | null;
  categoryIds: number[];
  types: JOB_TYPE[];

  constructor({ keyword, categoryIds, types }: { keyword: string | null; categoryIds: number[]; types: JOB_TYPE[] }) {
    this.keyword = keyword;
    this.categoryIds = categoryIds;
    this.types = types;
  }
}
