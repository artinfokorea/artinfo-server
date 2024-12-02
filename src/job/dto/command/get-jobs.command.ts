import { Paging } from '@/common/type/type';
import { MAJOR_GROUP_CATEGORY, PROFESSIONAL_FIELD_CATEGORY } from '@/job/entity/major-category.entity';
import { JOB_TYPE } from '@/job/entity/job.entity';

export class GetJobsCommand {
  keyword: string | null;
  paging: Paging;
  types: JOB_TYPE[];
  professionalFields: PROFESSIONAL_FIELD_CATEGORY[];
  provinceIds: number[];
  majorGroups: MAJOR_GROUP_CATEGORY[];

  constructor({
    keyword,
    paging,
    types,
    professionalFields,
    provinceIds,
    majorGroups,
  }: {
    keyword: string | null;
    paging: Paging;
    types: JOB_TYPE[];
    professionalFields: PROFESSIONAL_FIELD_CATEGORY[];
    provinceIds: number[];
    majorGroups: MAJOR_GROUP_CATEGORY[];
  }) {
    this.keyword = keyword;
    this.paging = paging;
    this.types = types;
    this.professionalFields = professionalFields;
    this.provinceIds = provinceIds;
    this.majorGroups = majorGroups;
  }
}
