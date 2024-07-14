export class CreateNewsCommand {
  thumbnailImageUrl: string;
  title: string;
  summary: string;
  contents: string;

  constructor({ thumbnailImageUrl, title, summary, contents }: { thumbnailImageUrl: string; title: string; summary: string; contents: string }) {
    this.thumbnailImageUrl = thumbnailImageUrl;
    this.title = title;
    this.summary = summary;
    this.contents = contents;
  }
}
