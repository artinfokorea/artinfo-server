import { ONGI_MEMBER_ROLE, OngiMember, OngiMemberCreator } from '@/ongi/group/domain/entity/ongi-member.entity';

export const ONGI_MEMBER_REPOSITORY = Symbol('ONGI_MEMBER_REPOSITORY');

/** 구성원 + 화면 표시용 부가 정보 */
export interface OngiMemberView {
  member: OngiMember;
  /** 실명 — 연결된 사용자(ongi_users)의 이름 */
  realName: string | null;
  /** 이 그룹에서 올린 사진 수 */
  photoCount: number;
  /** 조회한 사용자가 이 구성원을 차단했는지 */
  blockedByMe: boolean;
  /** 조회한 사용자 본인의 구성원 레코드인지 (사진·댓글 authorId 는 구성원 id) */
  isMe: boolean;
}

export interface IOngiMemberRepository {
  create(creator: OngiMemberCreator): Promise<OngiMember>;
  findById(id: number): Promise<OngiMember | null>;
  findByGroupIdAndUserId(groupId: number, userId: number): Promise<OngiMember | null>;
  scanByUserId(userId: number): Promise<OngiMember[]>;
  /** 그룹의 살아있는 구성원 (참여 순) */
  scanByGroupId(groupId: number): Promise<OngiMember[]>;
  updateRole(id: number, role: ONGI_MEMBER_ROLE): Promise<void>;
  scanViewsByGroupId(groupId: number, viewerUserId: number): Promise<OngiMemberView[]>;
  getViewById(id: number, viewerUserId: number): Promise<OngiMemberView | null>;
  softDeleteById(id: number): Promise<void>;
}
