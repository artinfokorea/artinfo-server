import { PostCategoryEnum } from '@/post/enum/PostCategoryEnum';

export class PostCreator {
  userId: number;
  category: PostCategoryEnum;
  title: string;
  contents: string;
  thumbnailImageUrl: string | null;

  constructor({
    userId,
    category,
    title,
    contents,
    thumbnailImageUrl,
  }: {
    userId: number;
    category: PostCategoryEnum;
    title: string;
    contents: string;
    thumbnailImageUrl: string | null;
  }) {
    this.userId = userId;
    this.category = category;
    this.title = title;
    this.contents = contents;
    this.thumbnailImageUrl = thumbnailImageUrl;
  }
}
