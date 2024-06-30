import { PROFESSIONAL_FIELD_CATEGORY } from '@/job/entity/major-category.entity';

export class LessonCounter {
  keyword: string | null;
  professionalFields: PROFESSIONAL_FIELD_CATEGORY[];
  provinceIds: number[];

  constructor({
    keyword,
    professionalFields,
    provinceIds,
  }: {
    keyword: string | null;
    professionalFields: PROFESSIONAL_FIELD_CATEGORY[];
    provinceIds: number[];
  }) {
    this.keyword = keyword;
    this.professionalFields = professionalFields;
    this.provinceIds = provinceIds;
  }
}
