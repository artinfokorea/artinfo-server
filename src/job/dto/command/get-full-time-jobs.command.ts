import { Paging } from '@/common/type/type';
import { FULL_TIME_JOB_TYPE } from '@/job/entity/full-time-job.entity';

export class GetFullTimeJobsCommand {
  paging: Paging;
  categoryIds: number[];
  type: FULL_TIME_JOB_TYPE;

  constructor({ paging, categoryIds, type }: { paging: Paging; categoryIds: number[]; type: FULL_TIME_JOB_TYPE }) {
    this.paging = paging;
    this.categoryIds = categoryIds;
    this.type = type;
  }
}
