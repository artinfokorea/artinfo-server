import { OnchurchNoticeCategory } from '@/onchurch/notice/domain/entity/onchurch-notice-category.entity';

export const ONCHURCH_NOTICE_CATEGORY_REPOSITORY = Symbol('ONCHURCH_NOTICE_CATEGORY_REPOSITORY');

export interface OnchurchNoticeCategoryWriteParams {
  name: string;
  sortOrder: number;
  isActive: boolean;
}

export interface IOnchurchNoticeCategoryRepository {
  ensureAllCategory(churchId: number): Promise<void>;
  restoreAllCategory(churchId: number): Promise<void>;
  findAllByChurchId(churchId: number): Promise<OnchurchNoticeCategory[]>;
  findActiveByChurchId(churchId: number): Promise<OnchurchNoticeCategory[]>;
  findOwnedById(churchId: number, id: number): Promise<OnchurchNoticeCategory | null>;
  create(churchId: number, params: OnchurchNoticeCategoryWriteParams): Promise<OnchurchNoticeCategory>;
  update(churchId: number, id: number, params: OnchurchNoticeCategoryWriteParams): Promise<OnchurchNoticeCategory>;
  remove(churchId: number, id: number): Promise<void>;
}
