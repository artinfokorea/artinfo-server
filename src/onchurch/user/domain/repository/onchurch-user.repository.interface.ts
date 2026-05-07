import { ONCHURCH_USER_ROLE, OnchurchUser } from '@/onchurch/user/domain/entity/onchurch-user.entity';

export const ONCHURCH_USER_REPOSITORY = Symbol('ONCHURCH_USER_REPOSITORY');

export interface IOnchurchUserRepository {
  create(params: {
    loginId: string;
    password: string;
    name: string;
    phone: string;
    role: ONCHURCH_USER_ROLE;
    churchName: string | null;
    churchId: number | null;
    marketingConsent: boolean;
    freeTrialUntil: Date | null;
  }): Promise<number>;
  findOneOrThrowById(id: number): Promise<OnchurchUser>;
  findByLoginId(loginId: string): Promise<OnchurchUser | null>;
  existsByLoginId(loginId: string): Promise<boolean>;
  saveEntity(user: OnchurchUser): Promise<void>;
}
