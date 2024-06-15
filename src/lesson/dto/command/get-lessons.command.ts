import { Paging } from '@/common/type/type';

export class GetLessonsCommand {
  keyword: string | null;
  paging: Paging;
  majorIds: number[];
  provinceIds: number[];

  constructor({ keyword, majorIds, provinceIds, paging }: { keyword: string | null; majorIds: number[]; provinceIds: number[]; paging: Paging }) {
    this.keyword = keyword;
    this.majorIds = majorIds;
    this.provinceIds = provinceIds;
    this.paging = paging;
  }
}
