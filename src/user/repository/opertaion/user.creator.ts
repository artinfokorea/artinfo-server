export class UserCreator {
  name: string;
  nickname: string;
  email: string;
  password: string | null;
  iconImageUrl: string | null;

  constructor({
    name,
    nickname,
    email,
    password,
    iconImageUrl,
  }: {
    name: string;
    nickname: string;
    email: string;
    password: string | null;
    iconImageUrl: string | null;
  }) {
    this.name = name;
    this.nickname = nickname;
    this.email = email;
    this.password = password;
    this.iconImageUrl = iconImageUrl;
  }
}
