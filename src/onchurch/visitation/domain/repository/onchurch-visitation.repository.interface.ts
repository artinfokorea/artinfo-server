import { OnchurchVisitation } from '@/onchurch/visitation/domain/entity/onchurch-visitation.entity';

export const ONCHURCH_VISITATION_REPOSITORY = Symbol('ONCHURCH_VISITATION_REPOSITORY');

export interface OnchurchVisitationWriteParams {
  saintId: number | null;
  saintName: string;
  minister: string;
  type: string;
  date: string;
  content: string | null;
}

export interface IOnchurchVisitationRepository {
  findAllByChurchId(churchId: number): Promise<OnchurchVisitation[]>;
  findOwnedById(churchId: number, id: number): Promise<OnchurchVisitation | null>;
  create(churchId: number, params: OnchurchVisitationWriteParams): Promise<OnchurchVisitation>;
  update(churchId: number, id: number, params: OnchurchVisitationWriteParams): Promise<OnchurchVisitation>;
  remove(churchId: number, id: number): Promise<void>;
}
