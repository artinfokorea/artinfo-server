import { PostCategoryEnum } from '@/post/enum/PostCategoryEnum';
import { PagingOperation } from '@/common/type/operation';

export class PostPagingFetcher extends PagingOperation {
  keyword: string | null;
  category: PostCategoryEnum | null;

  constructor({ page, size, keyword, category }: { page: number; size: number; keyword: string | null; category: PostCategoryEnum | null }) {
    super({ page: page, size: size });
    this.keyword = keyword;
    this.category = category;
  }
}
