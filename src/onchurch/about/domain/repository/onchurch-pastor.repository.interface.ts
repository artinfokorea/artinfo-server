import { OnchurchPastor } from '@/onchurch/about/domain/entity/onchurch-pastor.entity';

export const ONCHURCH_PASTOR_REPOSITORY = Symbol('ONCHURCH_PASTOR_REPOSITORY');

export interface OnchurchPastorWriteParams {
  name: string;
  role: string | null;
  eng: string | null;
  message: string | null;
  longMessage: string | null;
  photoUrl: string | null;
}

export interface IOnchurchPastorRepository {
  findByChurchId(churchId: number): Promise<OnchurchPastor | null>;
  upsertByChurchId(churchId: number, params: OnchurchPastorWriteParams): Promise<OnchurchPastor>;
}
