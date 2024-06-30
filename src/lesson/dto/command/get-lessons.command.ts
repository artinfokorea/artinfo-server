import { Paging } from '@/common/type/type';
import { PROFESSIONAL_FIELD_CATEGORY } from '@/job/entity/major-category.entity';

export class GetLessonsCommand {
  keyword: string | null;
  paging: Paging;
  professionalFields: PROFESSIONAL_FIELD_CATEGORY[];
  provinceIds: number[];

  constructor({
    keyword,
    professionalFields,
    provinceIds,
    paging,
  }: {
    keyword: string | null;
    professionalFields: PROFESSIONAL_FIELD_CATEGORY[];
    provinceIds: number[];
    paging: Paging;
  }) {
    this.keyword = keyword;
    this.professionalFields = professionalFields;
    this.provinceIds = provinceIds;
    this.paging = paging;
  }
}
