import { OnchurchSaint, OnchurchSaintGender } from '@/onchurch/saint/domain/entity/onchurch-saint.entity';

export const ONCHURCH_SAINT_REPOSITORY = Symbol('ONCHURCH_SAINT_REPOSITORY');

export interface OnchurchSaintWriteParams {
  name: string;
  photoUrl: string | null;
  birthDate: string | null;
  gender: OnchurchSaintGender | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  position: string | null;
  ordinationDate: string | null;
  faithLevel: string | null;
}

export interface IOnchurchSaintRepository {
  findAllByChurchId(churchId: number): Promise<OnchurchSaint[]>;
  findOwnedById(churchId: number, id: number): Promise<OnchurchSaint | null>;
  findByIds(churchId: number, ids: number[]): Promise<OnchurchSaint[]>;
  create(churchId: number, params: OnchurchSaintWriteParams): Promise<OnchurchSaint>;
  update(churchId: number, id: number, params: OnchurchSaintWriteParams): Promise<OnchurchSaint>;
  updateMemo(churchId: number, id: number, memo: string | null): Promise<OnchurchSaint>;
  remove(churchId: number, id: number): Promise<void>;
}
