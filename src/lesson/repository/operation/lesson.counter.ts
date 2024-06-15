export class LessonCounter {
  keyword: string | null;
  majorIds: number[];
  provinceIds: number[];

  constructor({ keyword, majorIds, provinceIds }: { keyword: string | null; majorIds: number[]; provinceIds: number[] }) {
    this.keyword = keyword;
    this.majorIds = majorIds;
    this.provinceIds = provinceIds;
  }
}
