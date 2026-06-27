import { OnchurchVisitationType } from '@/onchurch/visitation/domain/entity/onchurch-visitation-type.entity';

export const ONCHURCH_VISITATION_TYPE_REPOSITORY = Symbol('ONCHURCH_VISITATION_TYPE_REPOSITORY');

export interface IOnchurchVisitationTypeRepository {
  findAllByChurchId(churchId: number): Promise<OnchurchVisitationType[]>;
  findOwnedById(churchId: number, id: number): Promise<OnchurchVisitationType | null>;
  findByName(churchId: number, name: string): Promise<OnchurchVisitationType | null>;
  // 소프트 삭제분 포함 전체 개수 — 기본 종류 자동 시드 여부 판단에 사용.
  countAllIncludingDeleted(churchId: number): Promise<number>;
  create(churchId: number, name: string, sortOrder: number): Promise<OnchurchVisitationType>;
  createMany(churchId: number, names: string[]): Promise<OnchurchVisitationType[]>;
  remove(churchId: number, id: number): Promise<void>;
}
