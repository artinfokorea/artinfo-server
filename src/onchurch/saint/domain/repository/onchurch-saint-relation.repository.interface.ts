import { OnchurchSaintRelation } from '@/onchurch/saint/domain/entity/onchurch-saint-relation.entity';

export const ONCHURCH_SAINT_RELATION_REPOSITORY = Symbol('ONCHURCH_SAINT_RELATION_REPOSITORY');

export interface OnchurchSaintRelationCreateParams {
  saintId: number;
  relatedSaintId: number;
  relation: string;
}

export interface IOnchurchSaintRelationRepository {
  findBySaintId(churchId: number, saintId: number): Promise<OnchurchSaintRelation[]>;
  findOwnedById(churchId: number, id: number): Promise<OnchurchSaintRelation | null>;
  findPair(churchId: number, saintId: number, relatedSaintId: number): Promise<OnchurchSaintRelation | null>;
  removeBySaintId(churchId: number, saintId: number): Promise<void>;
  create(churchId: number, params: OnchurchSaintRelationCreateParams): Promise<OnchurchSaintRelation>;
  remove(churchId: number, id: number): Promise<void>;
}
