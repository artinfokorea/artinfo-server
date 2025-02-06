import { PostCategoryEnum } from '@/post/enum/PostCategoryEnum';
import { PostCreator } from '@/post/repository/dto/PostCreator';

export class CreatePostServiceDto {
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

  toCreator() {
    return new PostCreator({
      userId: this.userId,
      category: this.category,
      title: this.title,
      contents: this.contents,
      thumbnailImageUrl: this.thumbnailImageUrl,
    });
  }
}
