import { ApiProperty } from '@nestjs/swagger';
import { NotBlank, Enum } from '@/common/decorator/validator';
import { AZEYO_COMMUNITY_CATEGORY, AZEYO_COMMUNITY_POST_TYPE } from '@/azeyo/community/domain/entity/azeyo-community-post.entity';
import { AzeyoCreateCommunityPostCommand } from '@/azeyo/community/application/command/azeyo-create-community-post.command';

export class AzeyoCreateCommunityPostRequest {
  @Enum(AZEYO_COMMUNITY_POST_TYPE)
  @ApiProperty({ enum: AZEYO_COMMUNITY_POST_TYPE, required: true, description: '게시글 타입' })
  type: AZEYO_COMMUNITY_POST_TYPE;

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

  @ApiProperty({ type: String, required: false, description: '이미지 비율 (4:5 / 1:1)' })
  imageRatio: string | null;

  @ApiProperty({ type: String, required: false, description: '투표 옵션 A' })
  voteOptionA: string | null;

  @ApiProperty({ type: String, required: false, description: '투표 옵션 B' })
  voteOptionB: string | null;

  toCommand(userId: number) {
    return new AzeyoCreateCommunityPostCommand({
      userId,
      type: this.type,
      category: this.category,
      title: this.title,
      contents: this.contents,
      imageUrls: this.imageUrls ?? null,
      imageRatio: this.imageRatio ?? null,
      voteOptionA: this.voteOptionA ?? null,
      voteOptionB: this.voteOptionB ?? null,
    });
  }
}
