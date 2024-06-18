export class UserEditor {
  userId: number;
  birth: Date | null;
  majorIds: number[];
  iconImageUrl: string | null;

  constructor({ userId, birth, majorIds, iconImageUrl }: { userId: number; birth: Date | null; majorIds: number[]; iconImageUrl: string | null }) {
    this.userId = userId;
    this.birth = birth;
    this.majorIds = majorIds;
    this.iconImageUrl = iconImageUrl;
  }
}
