import { OngiCreateGroupUseCase, OngiJoinGroupUseCase } from '@/ongi/group/application/usecase/ongi-group.usecase';
import { IOngiGroupRepository } from '@/ongi/group/domain/repository/ongi-group.repository.interface';
import { IOngiMemberRepository } from '@/ongi/group/domain/repository/ongi-member.repository.interface';
import { IOngiUserRepository } from '@/ongi/user/domain/repository/ongi-user.repository.interface';
import { OngiMemberCreator } from '@/ongi/group/domain/entity/ongi-member.entity';
import { OngiPushService } from '@/ongi/push/application/service/ongi-push.service';

/**
 * 사용자: 1 엄마(프로필 이미지 있음) · 2 할머니(프로필 이미지 없음)
 * 공간: 10 우리 가족(초대 코드 123456, 만료 안 됨)
 * 기대: 새 공간을 만들거나 초대로 참여할 때 만들어지는 구성원은 사용자의 프로필 이미지를 그대로 이어받는다
 */
const MOM_AVATAR = 'https://artinfo.s3.ap-northeast-2.amazonaws.com/ongi/avatars/1/a.jpg';
const USERS = [
  { id: 1, name: '엄마', iconImageUrl: MOM_AVATAR },
  { id: 2, name: '할머니', iconImageUrl: null },
];

function build() {
  const created: OngiMemberCreator[] = [];
  const groupRepository = {
    create: async (creator: { name: string }) => ({ id: 99, ...creator }),
    findByInviteCode: async (code: string) => (code === '123456' ? { id: 10, name: '우리 가족', inviteExpiresAt: new Date(Date.now() + 86_400_000) } : null),
    scanSummariesByIds: async (ids: number[]) => ids.map(id => ({ id })),
  } as unknown as IOngiGroupRepository;
  const memberRepository = {
    create: async (creator: OngiMemberCreator) => {
      created.push(creator);
      return { id: 500 + created.length, ...creator };
    },
    findByGroupIdAndUserId: async () => null,
  } as unknown as IOngiMemberRepository;
  const userRepository = {
    findOneOrThrowById: async (id: number) => {
      const user = USERS.find(u => u.id === id);
      if (!user) throw new Error('no user');
      return user;
    },
  } as unknown as IOngiUserRepository;
  const pushService = { notifyGroup: () => {} } as unknown as OngiPushService;
  return {
    created,
    createGroup: new OngiCreateGroupUseCase(groupRepository, memberRepository, userRepository),
    joinGroup: new OngiJoinGroupUseCase(groupRepository, memberRepository, pushService, userRepository),
  };
}

describe('새 구성원은 사용자의 프로필 이미지를 이어받는다 — 공간마다 프로필 이미지가 달라지지 않게', () => {
  it('공간을 만들면 관리자 구성원의 avatarUrl 이 내 프로필 이미지가 된다', async () => {
    const { createGroup, created } = build();
    await createGroup.execute(1, '엄마', '새 공간');
    expect(created).toHaveLength(1);
    expect(created[0]).toMatchObject({ groupId: 99, userId: 1, name: '엄마', role: 'admin', avatarUrl: MOM_AVATAR });
  });

  it('초대 코드로 참여하면 구성원의 avatarUrl 이 내 프로필 이미지가 된다', async () => {
    const { joinGroup, created } = build();
    await joinGroup.execute(1, '엄마', '123456');
    expect(created).toHaveLength(1);
    expect(created[0]).toMatchObject({ groupId: 10, userId: 1, role: 'member', avatarUrl: MOM_AVATAR });
  });

  it('프로필 이미지가 없는 사용자는 지금처럼 null', async () => {
    const { createGroup, joinGroup, created } = build();
    await createGroup.execute(2, '할머니', '새 공간');
    await joinGroup.execute(2, '할머니', '123456');
    expect(created.map(c => c.avatarUrl)).toEqual([null, null]);
  });
});
