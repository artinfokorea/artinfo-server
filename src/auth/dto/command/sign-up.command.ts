export class SignUpCommand {
  name: string;
  email: string;
  password: string | null;

  constructor({ name, email, password }: { name: string; email: string; password: string | null }) {
    this.name = name;
    this.email = email;
    this.password = password;
  }
}
