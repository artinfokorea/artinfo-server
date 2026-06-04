import { OnchurchCommunityPost } from '@/onchurch/community/domain/entity/onchurch-community-post.entity';

export const ONCHURCH_COMMUNITY_POST_REPOSITORY = Symbol('ONCHURCH_COMMUNITY_POST_REPOSITORY');

export interface OnchurchCommunityPostWriteParams {
  authorId: number;
  authorName: string;
  category: string | null;
  title: string;
  content: string | null;
  photoUrls: string[];
  videoUrl: string | null;
}

export interface OnchurchCommunityPostUpdateParams {
  category: string | null;
  title: string;
  content: string | null;
  photoUrls: string[];
  videoUrl: string | null;
}

export interface IOnchurchCommunityPostRepository {
  // 공개: 숨김/삭제 제외, 카테고리 필터, 페이징
  findVisiblePagedByChurchId(
    churchId: number,
    params: { category?: string; skip: number; take: number },
  ): Promise<{ items: OnchurchCommunityPost[]; totalCount: number }>;
  findVisibleById(churchId: number, id: number): Promise<OnchurchCommunityPost | null>;
  // 관리자: 숨김 포함 전체
  findAllByChurchId(churchId: number): Promise<OnchurchCommunityPost[]>;
  findById(churchId: number, id: number): Promise<OnchurchCommunityPost | null>;
  create(churchId: number, params: OnchurchCommunityPostWriteParams): Promise<OnchurchCommunityPost>;
  updateOwn(churchId: number, id: number, authorId: number, params: OnchurchCommunityPostUpdateParams): Promise<OnchurchCommunityPost>;
  removeOwn(churchId: number, id: number, authorId: number): Promise<void>;
  setHidden(churchId: number, id: number, isHidden: boolean): Promise<OnchurchCommunityPost>;
  removeByChurch(churchId: number, id: number): Promise<void>;
  incrementReport(churchId: number, id: number): Promise<OnchurchCommunityPost>;
}
