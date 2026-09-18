import { OnchurchCustomPage, OnchurchCustomPageBlock } from '@/onchurch/custom-page/domain/entity/onchurch-custom-page.entity';

export const ONCHURCH_CUSTOM_PAGE_REPOSITORY = Symbol('ONCHURCH_CUSTOM_PAGE_REPOSITORY');

export interface OnchurchCustomPageWriteParams {
  slug: string;
  title: string;
  summary: string | null;
  blocks: OnchurchCustomPageBlock[];
  isActive: boolean;
}

export interface IOnchurchCustomPageRepository {
  findAllByChurchId(churchId: number): Promise<OnchurchCustomPage[]>;
  findActiveByChurchId(churchId: number): Promise<OnchurchCustomPage[]>;
  findActiveBySlug(churchId: number, slug: string): Promise<OnchurchCustomPage | null>;
  findOwnedById(churchId: number, id: number): Promise<OnchurchCustomPage | null>;
  existsBySlug(churchId: number, slug: string, exceptId?: number): Promise<boolean>;
  create(churchId: number, params: OnchurchCustomPageWriteParams): Promise<OnchurchCustomPage>;
  update(churchId: number, id: number, params: OnchurchCustomPageWriteParams): Promise<OnchurchCustomPage>;
  updateActive(churchId: number, id: number, isActive: boolean): Promise<OnchurchCustomPage>;
  reorder(churchId: number, orderedIds: number[]): Promise<void>;
  remove(churchId: number, id: number): Promise<void>;
}
