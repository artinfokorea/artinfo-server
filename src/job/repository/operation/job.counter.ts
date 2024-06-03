import { JOB_TYPE } from '@/job/entity/job.entity';

export class JobCounter {
  keyword: string | null;
  types: JOB_TYPE[];
  categoryIds: number[];

  constructor({ keyword, types, categoryIds }: { keyword: string | null; types: JOB_TYPE[]; categoryIds: number[] }) {
    this.keyword = keyword;
    this.types = types;
    this.categoryIds = categoryIds;
  }
}
