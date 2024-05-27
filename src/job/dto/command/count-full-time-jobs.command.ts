import { FULL_TIME_JOB_TYPE } from '@/job/entity/full-time-job.entity';

export class CountFullTimeJobsCommand {
  categoryIds: number[];
  type: FULL_TIME_JOB_TYPE;

  constructor({ categoryIds, type }: { categoryIds: number[]; type: FULL_TIME_JOB_TYPE }) {
    this.categoryIds = categoryIds;
    this.type = type;
  }
}
