import { AZEYO_COMMUNITY_CATEGORY, AZEYO_COMMUNITY_POST_TYPE } from '@/azeyo/community/domain/entity/azeyo-community-post.entity';

export class AzeyoCreateCommunityPostCommand {
  userId: number;
  type: AZEYO_COMMUNITY_POST_TYPE;
  category: AZEYO_COMMUNITY_CATEGORY;
  title: string;
  contents: string;
  imageUrls: string[] | null;
  imageRatio: string | null;
  voteOptionA: string | null;
  voteOptionB: string | null;

  constructor(params: {
    userId: number;
    type: AZEYO_COMMUNITY_POST_TYPE;
    category: AZEYO_COMMUNITY_CATEGORY;
    title: string;
    contents: string;
    imageUrls: string[] | null;
    imageRatio: string | null;
    voteOptionA: string | null;
    voteOptionB: string | null;
  }) {
    Object.assign(this, params);
  }
}
