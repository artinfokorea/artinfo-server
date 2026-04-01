import { AzeyoCommunityPost, AZEYO_COMMUNITY_CATEGORY } from '@/azeyo/community/domain/entity/azeyo-community-post.entity';

export const AZEYO_COMMUNITY_POST_REPOSITORY = Symbol('AZEYO_COMMUNITY_POST_REPOSITORY');

export interface IAzeyoCommunityPostRepository {
  create(post: Partial<AzeyoCommunityPost>): Promise<AzeyoCommunityPost>;
  findOneByIdOrThrow(id: number): Promise<AzeyoCommunityPost>;
  findOneByIdWithUserOrThrow(id: number): Promise<AzeyoCommunityPost>;
  findOneByIdAndUserIdOrThrow(id: number, userId: number): Promise<AzeyoCommunityPost>;
  findManyPaging(params: { skip: number; take: number; category: AZEYO_COMMUNITY_CATEGORY | null; keyword: string | null }): Promise<{ items: AzeyoCommunityPost[]; totalCount: number }>;
  findTop(): Promise<AzeyoCommunityPost[]>;
  incrementViewCount(id: number): Promise<void>;
  softRemove(post: AzeyoCommunityPost): Promise<void>;
  saveEntity(post: AzeyoCommunityPost): Promise<void>;
}
