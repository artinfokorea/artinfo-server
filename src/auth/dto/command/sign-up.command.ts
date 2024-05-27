export class SignUpCommand {
  name: string;
  email: string;
  password: string;

  constructor({ name, email, password }: SignUpCommand) {
    this.name = name;
    this.email = email;
    this.password = password;
  }
}
