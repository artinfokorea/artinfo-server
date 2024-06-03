import { Paging } from '@/common/type/type';
import { JOB_TYPE } from '@/job/entity/job.entity';

export class GetFullTimeJobsCommand {
  keyword: string | null;
  paging: Paging;
  categoryIds: number[];
  types: JOB_TYPE[];

  constructor({ keyword, paging, categoryIds, types }: { keyword: string | null; paging: Paging; categoryIds: number[]; types: JOB_TYPE[] }) {
    this.keyword = keyword;
    this.paging = paging;
    this.categoryIds = categoryIds;
    this.types = types;
  }
}
