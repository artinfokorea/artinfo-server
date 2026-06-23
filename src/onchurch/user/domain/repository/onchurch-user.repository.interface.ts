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
    referralSource: string | null;
    referralSourceEtc: string | null;
  }): Promise<number>;
  findOneOrThrowById(id: number): Promise<OnchurchUser>;
  findByLoginId(loginId: string): Promise<OnchurchUser | null>;
  findByPhone(phone: string): Promise<OnchurchUser[]>;
  existsByLoginId(loginId: string): Promise<boolean>;
  saveEntity(user: OnchurchUser): Promise<void>;
  // 마스터(MASTER)를 제외한 사용자 중 이름·아이디·연락처로 검색(오너 이관 대상 후보).
  searchCandidates(keyword: string, limit: number): Promise<OnchurchUser[]>;
  findMembersByChurchId(churchId: number): Promise<OnchurchUser[]>;
  findMemberByChurchId(churchId: number, id: number): Promise<OnchurchUser | null>;
  softDeleteById(id: number): Promise<void>;
}
