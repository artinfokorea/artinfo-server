import { PagingOperation } from '@/common/type/operation';
import { Paging } from '@/common/type/type';
import { PROFESSIONAL_FIELD_CATEGORY } from '@/job/entity/major-category.entity';
import { JOB_TYPE } from '@/job/entity/job.entity';

export class JobFetcher extends PagingOperation {
  keyword: string | null;
  types: JOB_TYPE[];
  professionalFields: PROFESSIONAL_FIELD_CATEGORY[];
  provinceIds: number[];

  constructor({
    keyword,
    types,
    professionalFields,
    paging,
    provinceIds,
  }: {
    keyword: string | null;
    types: JOB_TYPE[];
    professionalFields: PROFESSIONAL_FIELD_CATEGORY[];
    paging: Paging;
    provinceIds: number[];
  }) {
    super({ page: paging.page, size: paging.size });
    this.keyword = keyword;
    this.types = types;
    this.professionalFields = professionalFields;
    this.provinceIds = provinceIds;
  }
}
