import { OnchurchSaintTag } from '@/onchurch/saint/domain/entity/onchurch-saint-tag.entity';

export const ONCHURCH_SAINT_TAG_REPOSITORY = Symbol('ONCHURCH_SAINT_TAG_REPOSITORY');

export interface IOnchurchSaintTagRepository {
  findAllByChurchId(churchId: number): Promise<OnchurchSaintTag[]>;
  findOwnedById(churchId: number, id: number): Promise<OnchurchSaintTag | null>;
  findByName(churchId: number, name: string): Promise<OnchurchSaintTag | null>;
  findByIds(churchId: number, ids: number[]): Promise<OnchurchSaintTag[]>;
  // 소프트 삭제분 포함 전체 개수 — 기본 태그 자동 시드 여부 판단에 사용.
  countAllIncludingDeleted(churchId: number): Promise<number>;
  create(churchId: number, name: string, sortOrder: number): Promise<OnchurchSaintTag>;
  createMany(churchId: number, names: string[]): Promise<OnchurchSaintTag[]>;
  remove(churchId: number, id: number): Promise<void>;
}
