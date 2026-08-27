import { OngiGroup, OngiGroupCreator } from '@/ongi/group/domain/entity/ongi-group.entity';

export const ONGI_GROUP_REPOSITORY = Symbol('ONGI_GROUP_REPOSITORY');

/** 그룹 + 목록/상세 화면에 필요한 집계 */
export interface OngiGroupSummary {
  group: OngiGroup;
  memberCount: number;
  photoCount: number;
}

export interface IOngiGroupRepository {
  create(creator: OngiGroupCreator): Promise<OngiGroup>;
  findById(id: number): Promise<OngiGroup | null>;
  findByInviteCode(inviteCode: string): Promise<OngiGroup | null>;
  renewInviteCode(group: OngiGroup, inviteCode: string, inviteExpiresAt: Date): Promise<OngiGroup>;
  scanSummariesByIds(ids: number[]): Promise<OngiGroupSummary[]>;
  /** 마지막 구성원이 나가면 공간도 정리 */
  softDeleteById(id: number): Promise<void>;
}
