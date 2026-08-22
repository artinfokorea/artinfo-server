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
  /** 프로필 수정 — 구성원(ongi_members)·자동 생성 인물(ongi_people)에도 이름·이미지를 전파한다 */
  updateProfile(userId: number, patch: { name?: string; iconImageUrl?: string }): Promise<void>;
  getProfileStats(userId: number): Promise<OngiProfileStats>;
  /** 회원 탈퇴 — 계정 익명화 + 구성원·사진·댓글·인물·좋아요·차단·토큰까지 함께 삭제 */
  softDeleteById(id: number): Promise<void>;
}
