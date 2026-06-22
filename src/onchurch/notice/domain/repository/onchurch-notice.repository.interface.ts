import { OnchurchNotice, OnchurchNoticeAttachment } from '@/onchurch/notice/domain/entity/onchurch-notice.entity';

export const ONCHURCH_NOTICE_REPOSITORY = Symbol('ONCHURCH_NOTICE_REPOSITORY');

export interface OnchurchNoticeWriteParams {
  category: string | null;
  title: string;
  content: string | null;
  imageUrls: string[];
  attachments: OnchurchNoticeAttachment[];
  author: string | null;
  isPinned: boolean;
  isActive: boolean;
  publishedAt: Date | null;
}

export interface IOnchurchNoticeRepository {
  findAllByChurchId(churchId: number): Promise<OnchurchNotice[]>;
  findActivePagedByChurchId(churchId: number, params: { category?: string; keyword?: string; skip: number; take: number }): Promise<{ items: OnchurchNotice[]; totalCount: number }>;
  findOwnedById(churchId: number, id: number): Promise<OnchurchNotice | null>;
  create(churchId: number, params: OnchurchNoticeWriteParams): Promise<OnchurchNotice>;
  update(churchId: number, id: number, params: OnchurchNoticeWriteParams): Promise<OnchurchNotice>;
  remove(churchId: number, id: number): Promise<void>;
}
