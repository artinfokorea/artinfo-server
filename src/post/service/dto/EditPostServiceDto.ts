import { PostCategoryEnum } from '@/post/enum/PostCategoryEnum';
import { PostEditor } from '@/post/repository/dto/PostEditor';

export class EditPostServiceDto {
  userId: number;
  postId: number;
  category: PostCategoryEnum;
  title: string;
  contents: string;
  thumbnailImageUrl: string | null;

  constructor({
    userId,
    postId,
    category,
    title,
    contents,
    thumbnailImageUrl,
  }: {
    userId: number;
    postId: number;
    category: PostCategoryEnum;
    title: string;
    contents: string;
    thumbnailImageUrl: string | null;
  }) {
    this.userId = userId;
    this.postId = postId;
    this.category = category;
    this.title = title;
    this.contents = contents;
    this.thumbnailImageUrl = thumbnailImageUrl;
  }

  toEditor() {
    return new PostEditor({
      category: this.category,
      title: this.title,
      contents: this.contents,
      thumbnailImageUrl: this.thumbnailImageUrl,
    });
  }
}
