import { OnchurchSaintTagLink } from '@/onchurch/saint/domain/entity/onchurch-saint-tag-link.entity';

export const ONCHURCH_SAINT_TAG_LINK_REPOSITORY = Symbol('ONCHURCH_SAINT_TAG_LINK_REPOSITORY');

export interface IOnchurchSaintTagLinkRepository {
  findByChurchId(churchId: number): Promise<OnchurchSaintTagLink[]>;
  findBySaintId(churchId: number, saintId: number): Promise<OnchurchSaintTagLink[]>;
  // 한 성도의 태그 집합을 tagIds 로 교체한다.
  replaceForSaint(churchId: number, saintId: number, tagIds: number[]): Promise<void>;
  removeBySaintId(churchId: number, saintId: number): Promise<void>;
  removeByTagId(churchId: number, tagId: number): Promise<void>;
}
