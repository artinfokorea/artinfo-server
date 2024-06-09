export class UserEditor {
  userId: number;
  phone: string | null;
  birth: Date | null;
  majorIds: number[];
  iconImageUrl: string | null;

  constructor({
    userId,
    phone,
    birth,
    majorIds,
    iconImageUrl,
  }: {
    userId: number;
    phone: string | null;
    birth: Date | null;
    majorIds: number[];
    iconImageUrl: string | null;
  }) {
    this.userId = userId;
    this.phone = phone;
    this.birth = birth;
    this.majorIds = majorIds;
    this.iconImageUrl = iconImageUrl;
  }
}
