export class SignUpCommand {
  name: string;
  nickname: string;
  email: string;
  password: string | null;

  constructor({ name, nickname, email, password }: { name: string; nickname: string; email: string; password: string | null }) {
    this.name = name;
    this.nickname = nickname;
    this.email = email;
    this.password = password;
  }
}
