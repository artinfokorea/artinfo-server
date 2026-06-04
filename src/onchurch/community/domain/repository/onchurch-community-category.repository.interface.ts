import { OnchurchCommunityCategory } from '@/onchurch/community/domain/entity/onchurch-community-category.entity';

export const ONCHURCH_COMMUNITY_CATEGORY_REPOSITORY = Symbol('ONCHURCH_COMMUNITY_CATEGORY_REPOSITORY');

export interface OnchurchCommunityCategoryWriteParams {
  name: string;
  sortOrder: number;
  isActive: boolean;
}

export interface IOnchurchCommunityCategoryRepository {
  findAllByChurchId(churchId: number): Promise<OnchurchCommunityCategory[]>;
  findActiveByChurchId(churchId: number): Promise<OnchurchCommunityCategory[]>;
  findOwnedById(churchId: number, id: number): Promise<OnchurchCommunityCategory | null>;
  create(churchId: number, params: OnchurchCommunityCategoryWriteParams): Promise<OnchurchCommunityCategory>;
  update(churchId: number, id: number, params: OnchurchCommunityCategoryWriteParams): Promise<OnchurchCommunityCategory>;
  remove(churchId: number, id: number): Promise<void>;
}
