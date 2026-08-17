import { OngiMember, OngiMemberCreator } from '@/ongi/group/domain/entity/ongi-member.entity';

export const ONGI_MEMBER_REPOSITORY = Symbol('ONGI_MEMBER_REPOSITORY');

/** 구성원 + 화면 표시용 부가 정보 */
export interface OngiMemberView {
  member: OngiMember;
  /** 실명 — 연결된 사용자(ongi_users)의 이름 */
  realName: string | null;
  /** 이 그룹에서 올린 사진 수 */
  photoCount: number;
}

export interface IOngiMemberRepository {
  create(creator: OngiMemberCreator): Promise<OngiMember>;
  findById(id: number): Promise<OngiMember | null>;
  findByGroupIdAndUserId(groupId: number, userId: number): Promise<OngiMember | null>;
  scanByUserId(userId: number): Promise<OngiMember[]>;
  scanViewsByGroupId(groupId: number): Promise<OngiMemberView[]>;
  getViewById(id: number): Promise<OngiMemberView | null>;
}
