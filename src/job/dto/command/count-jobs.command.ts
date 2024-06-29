import { PROFESSIONAL_FIELD_CATEGORY } from '@/job/entity/major-category.entity';
import { JOB_TYPE } from '@/job/entity/job.entity';

export class CountJobsCommand {
  keyword: string | null;
  types: JOB_TYPE[];
  professionalFields: PROFESSIONAL_FIELD_CATEGORY[];
  provinceIds: number[];

  constructor({
    keyword,
    types,
    professionalFields,
    provinceIds,
  }: {
    keyword: string | null;
    types: JOB_TYPE[];
    professionalFields: PROFESSIONAL_FIELD_CATEGORY[];
    provinceIds: number[];
  }) {
    this.keyword = keyword;
    this.types = types;
    this.professionalFields = professionalFields;
    this.provinceIds = provinceIds;
  }
}
