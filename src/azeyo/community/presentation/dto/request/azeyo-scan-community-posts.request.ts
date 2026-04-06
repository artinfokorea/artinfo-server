import { ApiProperty } from '@nestjs/swagger';
import { List } from '@/common/type/type';
import { AZEYO_COMMUNITY_CATEGORY } from '@/azeyo/community/domain/entity/azeyo-community-post.entity';

export class AzeyoScanCommunityPostsRequest extends List {
  @ApiProperty({ type: String, required: false, description: '검색 키워드' })
  keyword: string | null = null;

  @ApiProperty({ enum: AZEYO_COMMUNITY_CATEGORY, required: false, description: '카테고리 필터' })
  category: AZEYO_COMMUNITY_CATEGORY | null;

  @ApiProperty({ type: Number, required: false, description: '특정 유저의 글만 조회' })
  authorId: number | null = null;
}
