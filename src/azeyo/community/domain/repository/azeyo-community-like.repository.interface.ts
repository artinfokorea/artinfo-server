import { AzeyoCommunityLike } from '@/azeyo/community/domain/entity/azeyo-community-like.entity';

export const AZEYO_COMMUNITY_LIKE_REPOSITORY = Symbol('AZEYO_COMMUNITY_LIKE_REPOSITORY');

export interface IAzeyoCommunityLikeRepository {
  findByTargetIdAndUserId(targetId: number, userId: number): Promise<AzeyoCommunityLike | null>;
  save(like: Partial<AzeyoCommunityLike>): Promise<AzeyoCommunityLike>;
  softRemove(like: AzeyoCommunityLike): Promise<void>;
  findManyByTargetIdsAndUserId(targetIds: number[], userId: number): Promise<AzeyoCommunityLike[]>;
  countByTargetIds(targetIds: number[]): Promise<{ targetId: number; count: number }[]>;
}
