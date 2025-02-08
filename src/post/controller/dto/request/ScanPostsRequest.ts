import { ApiProperty } from '@nestjs/swagger';
import { List } from '@/common/type/type';
import { PostCategoryEnum } from '@/post/enum/PostCategoryEnum';
import { ScanPostsServiceDto } from '@/post/service/dto/ScanPostsServiceDto';

export class ScanPostsRequest extends List {
  @ApiProperty({ type: String, required: false, description: '검색 키워드', example: '질문' })
  keyword: string | null = null;

  @ApiProperty({ enum: PostCategoryEnum, enumName: 'PostCategoryEnum', required: false, description: '카테고리 타입', example: PostCategoryEnum.ETC })
  category: PostCategoryEnum | null;

  toServiceDto(userId?: number) {
    return new ScanPostsServiceDto({
      userId: userId ?? null,
      keyword: this.keyword,
      category: this.category,
      page: this.page,
      size: this.size,
    });
  }
}
