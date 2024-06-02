import { JOB_TYPE } from '@/job/entity/job.entity';

export class CountFullTimeJobsCommand {
  categoryIds: number[];
  types: JOB_TYPE[];

  constructor({ categoryIds, types }: { categoryIds: number[]; types: JOB_TYPE[] }) {
    this.categoryIds = categoryIds;
    this.types = types;
  }
}
