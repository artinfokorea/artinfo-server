import { PagingOperation } from '@/common/type/operation';
import { Paging } from '@/common/type/type';
import { PROFESSIONAL_FIELD_CATEGORY } from '@/job/entity/major-category.entity';

export class LessonFetcher extends PagingOperation {
  keyword: string | null;
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
    super({ page: paging.page, size: paging.size });
    this.keyword = keyword;
    this.professionalFields = professionalFields;
    this.provinceIds = provinceIds;
  }
}
