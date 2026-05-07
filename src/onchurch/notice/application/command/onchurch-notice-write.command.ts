export class OnchurchNoticeWriteCommand {
  category: string | null;
  title: string;
  content: string | null;
  author: string | null;
  isPinned: boolean;
  isActive: boolean;
  publishedAt: Date | null;

  constructor(params: {
    category: string | null;
    title: string;
    content: string | null;
    author: string | null;
    isPinned: boolean;
    isActive: boolean;
    publishedAt: Date | null;
  }) {
    this.category = params.category;
    this.title = params.title;
    this.content = params.content;
    this.author = params.author;
    this.isPinned = params.isPinned;
    this.isActive = params.isActive;
    this.publishedAt = params.publishedAt;
  }
}
