import { Paging } from '@/common/type/type';
import { PROFESSIONAL_FIELD_CATEGORY } from '@/job/entity/major-category.entity';
import { JOB_TYPE } from '@/job/entity/job.entity';

export class GetJobsCommand {
  keyword: string | null;
  paging: Paging;
  types: JOB_TYPE[];
  professionalFields: PROFESSIONAL_FIELD_CATEGORY[];
  provinceIds: number[];

  constructor({
    keyword,
    paging,
    types,
    professionalFields,
    provinceIds,
  }: {
    keyword: string | null;
    paging: Paging;
    types: JOB_TYPE[];
    professionalFields: PROFESSIONAL_FIELD_CATEGORY[];
    provinceIds: number[];
  }) {
    this.keyword = keyword;
    this.paging = paging;
    this.types = types;
    this.professionalFields = professionalFields;
    this.provinceIds = provinceIds;
  }
}
