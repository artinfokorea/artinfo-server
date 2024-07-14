export class EditNewsCommand {
  newsId: number;
  thumbnailImageUrl: string;
  title: string;
  summary: string;
  contents: string;

  constructor({
    newsId,
    thumbnailImageUrl,
    title,
    summary,
    contents,
  }: {
    newsId: number;
    thumbnailImageUrl: string;
    title: string;
    summary: string;
    contents: string;
  }) {
    this.newsId = newsId;
    this.thumbnailImageUrl = thumbnailImageUrl;
    this.title = title;
    this.summary = summary;
    this.contents = contents;
  }
}
