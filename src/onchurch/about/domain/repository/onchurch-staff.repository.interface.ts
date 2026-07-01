import { OnchurchStaff } from '@/onchurch/about/domain/entity/onchurch-staff.entity';

export const ONCHURCH_STAFF_REPOSITORY = Symbol('ONCHURCH_STAFF_REPOSITORY');

export interface OnchurchStaffWriteParams {
  name: string;
  role: string | null;
  area: string | null;
  photoUrl: string | null;
  phone: string | null;
  email: string | null;
  sortOrder: number;
}

export interface IOnchurchStaffRepository {
  findAllByChurchId(churchId: number): Promise<OnchurchStaff[]>;
  findOwnedById(churchId: number, id: number): Promise<OnchurchStaff | null>;
  create(churchId: number, params: OnchurchStaffWriteParams): Promise<OnchurchStaff>;
  update(churchId: number, id: number, params: OnchurchStaffWriteParams): Promise<OnchurchStaff>;
  remove(churchId: number, id: number): Promise<void>;
}
