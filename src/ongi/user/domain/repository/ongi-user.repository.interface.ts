import { ONGI_SNS_TYPE, OngiUser, OngiUserCreator } from '@/ongi/user/domain/entity/ongi-user.entity';

export const ONGI_USER_REPOSITORY = Symbol('ONGI_USER_REPOSITORY');

/** 프로필 탭 통계 — 전부 ongi_* 테이블 집계로 계산 */
export interface OngiProfileStats {
  photoCount: number;
  albumCount: number;
  familyCount: number;
}

export interface IOngiUserRepository {
  create(creator: OngiUserCreator): Promise<OngiUser>;
  findById(id: number): Promise<OngiUser | null>;
  findOneOrThrowById(id: number): Promise<OngiUser>;
  findBySnsId(snsType: ONGI_SNS_TYPE, snsId: string): Promise<OngiUser | null>;
  getProfileStats(userId: number): Promise<OngiProfileStats>;
  softDeleteById(id: number): Promise<void>;
}
