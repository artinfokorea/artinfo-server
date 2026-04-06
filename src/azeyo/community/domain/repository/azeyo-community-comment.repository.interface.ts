import { AzeyoCommunityComment } from '@/azeyo/community/domain/entity/azeyo-community-comment.entity';

export const AZEYO_COMMUNITY_COMMENT_REPOSITORY = Symbol('AZEYO_COMMUNITY_COMMENT_REPOSITORY');

export interface IAzeyoCommunityCommentRepository {
  create(comment: Partial<AzeyoCommunityComment>): Promise<AzeyoCommunityComment>;
  findOneById(id: number): Promise<AzeyoCommunityComment | null>;
  findOneByIdAndUserIdOrThrow(id: number, userId: number): Promise<AzeyoCommunityComment>;
  findByPostId(postId: number, params: { parentId: number | null; skip: number; take: number }): Promise<{ items: AzeyoCommunityComment[]; totalCount: number }>;
  editContents(id: number, userId: number, contents: string): Promise<void>;
  deleteWithChildren(id: number, userId: number): Promise<void>;
  countByPostIds(postIds: number[]): Promise<{ postId: number; count: number }[]>;
}
