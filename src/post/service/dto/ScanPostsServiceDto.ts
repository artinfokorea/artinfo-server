import { PostCategoryEnum } from '@/post/enum/PostCategoryEnum';
import { PostPagingFetcher } from '@/post/repository/dto/PostPagingFetcher';

export class ScanPostsServiceDto {
  userId: number | null;
  keyword: string | null;
  category: PostCategoryEnum | null;
  page: number;
  size: number;

  constructor({
    userId,
    keyword,
    category,
    page,
    size,
  }: {
    userId: number | null;
    keyword: string | null;
    category: PostCategoryEnum | null;
    page: number;
    size: number;
  }) {
    this.userId = userId;
    this.keyword = keyword;
    this.category = category;
    this.page = page;
    this.size = size;
  }

  toFetcher() {
    return new PostPagingFetcher({
      keyword: this.keyword,
      category: this.category,
      page: this.page,
      size: this.size,
    });
  }
}
