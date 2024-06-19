export class UserEditor {
  name: string;
  nickname: string;
  userId: number;
  birth: Date | null;
  majorIds: number[];
  iconImageUrl: string | null;

  constructor({
    name,
    nickname,
    userId,
    birth,
    majorIds,
    iconImageUrl,
  }: {
    name: string;
    nickname: string;
    userId: number;
    birth: Date | null;
    majorIds: number[];
    iconImageUrl: string | null;
  }) {
    this.name = name;
    this.nickname = nickname;
    this.userId = userId;
    this.birth = birth;
    this.majorIds = majorIds;
    this.iconImageUrl = iconImageUrl;
  }
}
