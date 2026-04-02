export class AzeyoCreateScheduleCommand {
  userId: number;
  title: string;
  date: string;
  memo: string | null;
  tagIds: number[];

  constructor(params: {
    userId: number;
    title: string;
    date: string;
    memo: string | null;
    tagIds: number[];
  }) {
    Object.assign(this, params);
  }
}
