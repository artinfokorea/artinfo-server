import { Paging } from '@/common/type/type';
import { JOB_TYPE } from '@/job/entity/job.entity';

export class GetFullTimeJobsCommand {
  paging: Paging;
  categoryIds: number[];
  types: JOB_TYPE[];

  constructor({ paging, categoryIds, types }: { paging: Paging; categoryIds: number[]; types: JOB_TYPE[] }) {
    this.paging = paging;
    this.categoryIds = categoryIds;
    this.types = types;
  }
}
