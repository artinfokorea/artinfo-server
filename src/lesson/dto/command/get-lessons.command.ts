import { Paging } from '@/common/type/type';

export class GetLessonsCommand {
  keyword: string | null;
  paging: Paging;

  constructor({ keyword, paging }: { keyword: string | null; paging: Paging }) {
    this.keyword = keyword;
    this.paging = paging;
  }
}
