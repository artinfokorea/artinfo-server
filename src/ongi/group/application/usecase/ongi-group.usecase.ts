import { Inject, Injectable } from '@nestjs/common';
import { IOngiGroupRepository, ONGI_GROUP_REPOSITORY, OngiGroupSummary } from '@/ongi/group/domain/repository/ongi-group.repository.interface';
import { IOngiMemberRepository, ONGI_MEMBER_REPOSITORY, OngiMemberView } from '@/ongi/group/domain/repository/ongi-member.repository.interface';
import { ONGI_MEMBER_ROLE } from '@/ongi/group/domain/entity/ongi-member.entity';
import {
  OngiGroupNotFound,
  OngiInviteCodeExpired,
  OngiInviteCodeNotFound,
  OngiMemberNotFound,
  OngiNotGroupMember,
} from '@/ongi/group/domain/exception/ongi-group.exception';

const INVITE_EXPIRE_DAYS = 7;
/** 헷갈리는 문자(0/O/1/I) 를 제외한 초대 코드 문자셋 */
const INVITE_CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function generateInviteCode(): string {
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += INVITE_CODE_CHARS[Math.floor(Math.random() * INVITE_CODE_CHARS.length)];
  }

  return `ONGI-${code}`;
}

function inviteExpiresAt(): Date {
  return new Date(Date.now() + INVITE_EXPIRE_DAYS * 24 * 60 * 60 * 1000);
}

@Injectable()
export class OngiScanMyGroupsUseCase {
  constructor(
    @Inject(ONGI_GROUP_REPOSITORY)
    private readonly groupRepository: IOngiGroupRepository,

    @Inject(ONGI_MEMBER_REPOSITORY)
    private readonly memberRepository: IOngiMemberRepository,
  ) {}

  async execute(userId: number): Promise<OngiGroupSummary[]> {
    const members = await this.memberRepository.scanByUserId(userId);

    return this.groupRepository.scanSummariesByIds(members.map(member => member.groupId));
  }
}

@Injectable()
export class OngiGetGroupUseCase {
  constructor(
    @Inject(ONGI_GROUP_REPOSITORY)
    private readonly groupRepository: IOngiGroupRepository,

    @Inject(ONGI_MEMBER_REPOSITORY)
    private readonly memberRepository: IOngiMemberRepository,
  ) {}

  async execute(userId: number, groupId: number): Promise<OngiGroupSummary> {
    const member = await this.memberRepository.findByGroupIdAndUserId(groupId, userId);
    if (!member) throw new OngiNotGroupMember();

    let group = await this.groupRepository.findById(groupId);
    if (!group) throw new OngiGroupNotFound();

    // 초대 코드가 만료됐으면 조회 시점에 자동 갱신해 초대가 항상 가능하게 유지
    if (group.inviteExpiresAt.getTime() < Date.now()) {
      group = await this.groupRepository.renewInviteCode(group, generateInviteCode(), inviteExpiresAt());
    }

    const [summary] = await this.groupRepository.scanSummariesByIds([group.id]);

    return summary;
  }
}

@Injectable()
export class OngiCreateGroupUseCase {
  constructor(
    @Inject(ONGI_GROUP_REPOSITORY)
    private readonly groupRepository: IOngiGroupRepository,

    @Inject(ONGI_MEMBER_REPOSITORY)
    private readonly memberRepository: IOngiMemberRepository,
  ) {}

  async execute(userId: number, userName: string, name: string): Promise<OngiGroupSummary> {
    const group = await this.groupRepository.create({
      name,
      inviteCode: generateInviteCode(),
      inviteExpiresAt: inviteExpiresAt(),
    });

    await this.memberRepository.create({
      groupId: group.id,
      userId,
      name: userName,
      role: ONGI_MEMBER_ROLE.ADMIN,
      avatarUrl: null,
    });

    const [summary] = await this.groupRepository.scanSummariesByIds([group.id]);

    return summary;
  }
}

@Injectable()
export class OngiJoinGroupUseCase {
  constructor(
    @Inject(ONGI_GROUP_REPOSITORY)
    private readonly groupRepository: IOngiGroupRepository,

    @Inject(ONGI_MEMBER_REPOSITORY)
    private readonly memberRepository: IOngiMemberRepository,
  ) {}

  async execute(userId: number, userName: string, inviteCode: string): Promise<OngiGroupSummary> {
    const group = await this.groupRepository.findByInviteCode(inviteCode.trim().toUpperCase());
    if (!group) throw new OngiInviteCodeNotFound();
    if (group.inviteExpiresAt.getTime() < Date.now()) throw new OngiInviteCodeExpired();

    const existing = await this.memberRepository.findByGroupIdAndUserId(group.id, userId);
    if (!existing) {
      await this.memberRepository.create({
        groupId: group.id,
        userId,
        name: userName,
        role: ONGI_MEMBER_ROLE.MEMBER,
        avatarUrl: null,
      });
    }

    const [summary] = await this.groupRepository.scanSummariesByIds([group.id]);

    return summary;
  }
}

@Injectable()
export class OngiScanMembersUseCase {
  constructor(
    @Inject(ONGI_MEMBER_REPOSITORY)
    private readonly memberRepository: IOngiMemberRepository,
  ) {}

  async execute(userId: number, groupId: number): Promise<OngiMemberView[]> {
    const me = await this.memberRepository.findByGroupIdAndUserId(groupId, userId);
    if (!me) throw new OngiNotGroupMember();

    return this.memberRepository.scanViewsByGroupId(groupId);
  }
}

@Injectable()
export class OngiGetMemberUseCase {
  constructor(
    @Inject(ONGI_MEMBER_REPOSITORY)
    private readonly memberRepository: IOngiMemberRepository,
  ) {}

  async execute(userId: number, memberId: number): Promise<OngiMemberView> {
    const view = await this.memberRepository.getViewById(memberId);
    if (!view) throw new OngiMemberNotFound();

    const me = await this.memberRepository.findByGroupIdAndUserId(view.member.groupId, userId);
    if (!me) throw new OngiNotGroupMember();

    return view;
  }
}
