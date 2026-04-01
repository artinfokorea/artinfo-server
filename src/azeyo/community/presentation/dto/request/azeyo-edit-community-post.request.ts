import { ApiProperty } from '@nestjs/swagger';
import { NotBlank, Enum } from '@/common/decorator/validator';
import { AZEYO_COMMUNITY_CATEGORY } from '@/azeyo/community/domain/entity/azeyo-community-post.entity';

export class AzeyoEditCommunityPostRequest {
  @Enum(AZEYO_COMMUNITY_CATEGORY)
  @ApiProperty({ enum: AZEYO_COMMUNITY_CATEGORY, required: true, description: '카테고리' })
  category: AZEYO_COMMUNITY_CATEGORY;

  @NotBlank()
  @ApiProperty({ type: String, required: true, description: '제목' })
  title: string;

  @NotBlank()
  @ApiProperty({ type: String, required: true, description: '내용' })
  contents: string;

  @ApiProperty({ type: [String], required: false, description: '이미지 URL 목록' })
  imageUrls: string[] | null;

  @ApiProperty({ type: String, required: false, description: '이미지 비율' })
  imageRatio: string | null;

  @ApiProperty({ type: String, required: false, description: '투표 옵션 A' })
  voteOptionA: string | null;

  @ApiProperty({ type: String, required: false, description: '투표 옵션 B' })
  voteOptionB: string | null;
}
