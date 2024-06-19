export class CreateInquiryCommand {
  title: string;
  contents: string;
  email: string;

  constructor({ title, contents, email }: { title: string; contents: string; email: string }) {
    this.title = title;
    this.contents = contents;
    this.email = email;
  }
}
