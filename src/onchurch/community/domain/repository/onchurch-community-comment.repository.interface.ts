import { OnchurchCommunityComment } from '@/onchurch/community/domain/entity/onchurch-community-comment.entity';

export const ONCHURCH_COMMUNITY_COMMENT_REPOSITORY = Symbol('ONCHURCH_COMMUNITY_COMMENT_REPOSITORY');

export interface IOnchurchCommunityCommentRepository {
  findByPostId(churchId: number, postId: number): Promise<OnchurchCommunityComment[]>;
  // 게시글 목록 카드에 댓글 수를 붙이기 위한 일괄 집계 (postId → count)
  countByPostIds(churchId: number, postIds: number[]): Promise<Map<number, number>>;
  findById(churchId: number, id: number): Promise<OnchurchCommunityComment | null>;
  create(params: { churchId: number; postId: number; authorId: number; authorName: string; content: string }): Promise<OnchurchCommunityComment>;
  remove(comment: OnchurchCommunityComment): Promise<void>;
}
