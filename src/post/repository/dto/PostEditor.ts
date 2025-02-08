import { PostCategoryEnum } from '@/post/enum/PostCategoryEnum';

export class PostEditor {
  category: PostCategoryEnum;
  title: string;
  contents: string;
  thumbnailImageUrl: string | null;

  constructor({
    category,
    title,
    contents,
    thumbnailImageUrl,
  }: {
    category: PostCategoryEnum;
    title: string;
    contents: string;
    thumbnailImageUrl: string | null;
  }) {
    this.category = category;
    this.title = title;
    this.contents = contents;
    this.thumbnailImageUrl = thumbnailImageUrl;
  }
}
