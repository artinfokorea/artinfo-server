import { PagingOperation } from '@/common/type/operation';
import { Paging } from '@/common/type/type';
import { MAJOR } from '@/job/entity/major-category.entity';

export class AdmissionFetcher extends PagingOperation {
  keyword: string | null;
  year: number | null;
  majorCategoryIds: number[];
  majors: MAJOR[];

  constructor({
    keyword,
    year,
    majorCategoryIds,
    majors,
    paging,
  }: {
    keyword: string | null;
    year: number | null;
    majorCategoryIds: number[];
    majors: MAJOR[];
    paging: Paging;
  }) {
    super({ page: paging.page, size: paging.size });
    this.keyword = keyword;
    this.year = year;
    this.majorCategoryIds = majorCategoryIds;
    this.majors = majors;
  }
}
