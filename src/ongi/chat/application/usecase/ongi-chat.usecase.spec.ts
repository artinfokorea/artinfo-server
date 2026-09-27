import { OngiChatUseCase } from '@/ongi/chat/application/usecase/ongi-chat.usecase';
import { IOngiChatRepository, OngiChatRoomRow, OngiChatUserSummary } from '@/ongi/chat/domain/repository/ongi-chat.repository.interface';
import { OngiChatRoom, OngiChatRoomCreator } from '@/ongi/chat/domain/entity/ongi-chat-room.entity';
import { OngiChatParticipant } from '@/ongi/chat/domain/entity/ongi-chat-participant.entity';
import { OngiChatMessage, OngiChatMessageCreator } from '@/ongi/chat/domain/entity/ongi-chat-message.entity';
import { IOngiChatRealtime } from '@/ongi/chat/domain/repository/ongi-chat-realtime.interface';
import {
  OngiChatBlocked,
  OngiChatInvalidMessage,
  OngiChatInvalidRoomName,
  OngiChatInvalidTargets,
  OngiChatNotGroupRoom,
  OngiChatRoomNotFound,
} from '@/ongi/chat/domain/exception/ongi-chat.exception';
import { IOngiMemberRepository } from '@/ongi/group/domain/repository/ongi-member.repository.interface';
import { IOngiBlockRepository } from '@/ongi/group/domain/repository/ongi-block.repository.interface';
import { OngiPushService } from '@/ongi/push/application/service/ongi-push.service';

/**
 * 사용자: 1 엄마 · 2 아빠 · 3 민수 · 4 수진 · 5 지현 · 6 대기중 · 9 모르는 사람
 * 공간: 10 우리 가족(1·2·3) · 20 외가(1·4, 6 은 승인 대기) · 30 다른 집(5·9, 엄마는 없음)
 */
const USERS: Record<number, string> = { 1: '엄마', 2: '아빠', 3: '민수', 4: '수진', 5: '지현', 6: '대기중', 9: '모르는 사람' };
const MEMBERS = [
  { id: 101, userId: 1, groupId: 10, role: 'admin' },
  { id: 102, userId: 2, groupId: 10, role: 'member' },
  { id: 103, userId: 3, groupId: 10, role: 'member' },
  { id: 201, userId: 1, groupId: 20, role: 'admin' },
  { id: 204, userId: 4, groupId: 20, role: 'member' },
  { id: 206, userId: 6, groupId: 20, role: 'pending' },
  { id: 305, userId: 5, groupId: 30, role: 'admin' },
  { id: 309, userId: 9, groupId: 30, role: 'member' },
];
const PHOTO_URL = 'https://artinfo.s3.ap-northeast-2.amazonaws.com/ongi/photos/1/20260927/a.jpg';

class FakeChatRepository implements IOngiChatRepository {
  rooms: OngiChatRoom[] = [];
  participants: OngiChatParticipant[] = [];
  messages: OngiChatMessage[] = [];
  deletedUserIds = new Set<number>();

  async findRoomById(roomId: number) {
    return this.rooms.find(r => r.id === roomId) ?? null;
  }

  async findRoomByDirectKey(directKey: string) {
    return this.rooms.find(r => r.directKey === directKey) ?? null;
  }

  async createRoom(creator: OngiChatRoomCreator, userIds: number[]) {
    const room = {
      ...creator,
      id: this.rooms.length + 1,
      lastMessageId: null,
      lastMessageAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as OngiChatRoom;
    this.rooms.push(room);
    await this.addParticipants(room.id, userIds, 0);
    return room;
  }

  async findParticipant(roomId: number, userId: number) {
    return this.participants.find(p => p.roomId === roomId && p.userId === userId) ?? null;
  }

  async scanParticipants(roomId: number) {
    return this.participants.filter(p => p.roomId === roomId);
  }

  async addParticipants(roomId: number, userIds: number[], fromMessageId: number) {
    for (const userId of userIds) {
      const existing = await this.findParticipant(roomId, userId);
      if (existing) {
        Object.assign(existing, { leftAt: null, visibleFromMessageId: fromMessageId, lastReadMessageId: fromMessageId });
      } else {
        this.participants.push({
          id: this.participants.length + 1,
          roomId,
          userId,
          lastReadMessageId: fromMessageId,
          visibleFromMessageId: fromMessageId,
          leftAt: null,
        } as OngiChatParticipant);
      }
    }
  }

  async leave(roomId: number, userId: number) {
    const p = await this.findParticipant(roomId, userId);
    if (p) p.leftAt = new Date();
  }

  async hideUntil(roomId: number, userId: number, messageId: number) {
    const p = await this.findParticipant(roomId, userId);
    if (p) Object.assign(p, { visibleFromMessageId: messageId, lastReadMessageId: Math.max(p.lastReadMessageId, messageId) });
  }

  async markRead(roomId: number, userId: number, messageId: number) {
    const p = (await this.findParticipant(roomId, userId))!;
    p.lastReadMessageId = Math.max(p.lastReadMessageId, messageId);
    return p.lastReadMessageId;
  }

  async leaveAllOfUser(userId: number) {
    this.participants.filter(p => p.userId === userId).forEach(p => (p.leftAt = new Date()));
  }

  async createMessage(creator: OngiChatMessageCreator) {
    const message = { ...creator, id: this.messages.length + 1, createdAt: new Date(Date.UTC(2026, 8, 27, 0, this.messages.length)) } as OngiChatMessage;
    this.messages.push(message);
    const room = (await this.findRoomById(creator.roomId))!;
    room.lastMessageId = message.id;
    room.lastMessageAt = message.createdAt;
    return message;
  }

  async findMessageById(messageId: number) {
    return this.messages.find(m => m.id === messageId) ?? null;
  }

  async scanMessages(roomId: number, visibleFromMessageId: number, beforeId: number | null, limit: number) {
    return this.messages
      .filter(m => m.roomId === roomId && m.id > visibleFromMessageId && (beforeId === null || m.id < beforeId))
      .sort((a, b) => b.id - a.id)
      .slice(0, limit);
  }

  async scanRoomRows(userId: number): Promise<OngiChatRoomRow[]> {
    return this.participants
      .filter(p => p.userId === userId && !p.leftAt)
      .map(me => {
        const room = this.rooms.find(r => r.id === me.roomId)!;
        const visible = this.messages.filter(m => m.roomId === room.id && m.id > me.visibleFromMessageId);
        return {
          room,
          me,
          lastMessage: visible[visible.length - 1] ?? null,
          unreadCount: visible.filter(m => m.id > me.lastReadMessageId && m.type !== 'system' && m.senderUserId !== userId).length,
          userIds: this.participants.filter(p => p.roomId === room.id && (room.type === 'direct' || !p.leftAt)).map(p => p.userId),
        };
      })
      .filter(row => row.lastMessage !== null)
      .sort((a, b) => b.lastMessage!.id - a.lastMessage!.id);
  }

  async countUnread(userId: number) {
    return (await this.scanRoomRows(userId)).reduce((sum, row) => sum + row.unreadCount, 0);
  }

  async scanUserSummaries(userIds: number[]): Promise<OngiChatUserSummary[]> {
    return userIds.map(id => ({ id, name: this.deletedUserIds.has(id) ? '탈퇴한 사용자' : USERS[id], avatarUrl: null, deleted: this.deletedUserIds.has(id) }));
  }
}

function setup() {
  const repository = new FakeChatRepository();
  const members = MEMBERS.map(m => ({ ...m, deletedAt: null as Date | null }));
  const blocks: [number, number][] = [];
  const pushed: { userId: number; senderUserId: number; title: string; body: string; data?: Record<string, string>; category?: string; inbox?: boolean }[] = [];
  const emitted: { userIds: number[]; event: string; payload: Record<string, string> }[] = [];

  const memberRepository = {
    findById: async (id: number) => members.find(m => m.id === id && !m.deletedAt) ?? null,
    scanByUserId: async (userId: number) => members.filter(m => m.userId === userId && !m.deletedAt),
  } as unknown as IOngiMemberRepository;
  const blockRepository = {
    blockedUserIdsOf: async (userId: number) => blocks.filter(([by]) => by === userId).map(([, target]) => target),
  } as unknown as IOngiBlockRepository;
  const pushService = {
    notifyUser: (
      userId: number,
      senderUserId: number,
      message: { title: string; body: string; data?: Record<string, string>; category?: string; inbox?: boolean },
    ) => {
      pushed.push({ userId, senderUserId, ...message });
    },
  } as unknown as OngiPushService;
  const realtime: IOngiChatRealtime = {
    emit: (userIds, event, payload) => {
      emitted.push({ userIds: [...userIds].sort(), event, payload });
    },
  };

  const useCase = new OngiChatUseCase(repository, memberRepository, blockRepository, pushService, realtime);

  return { useCase, repository, members, blocks, pushed, emitted };
}

describe('OngiChatUseCase.createRoom — 방 만들기', () => {
  it('한 명을 고르면 1:1 방 — 시스템 메시지 없음, 방 이름은 무시', async () => {
    const { useCase, repository } = setup();

    const view = await useCase.createRoom(1, { memberIds: [102], name: '무시될 이름' });

    expect(view.room.type).toBe('direct');
    expect(view.room.name).toBeNull();
    expect(view.room.directKey).toBe('1:2');
    expect(view.title).toBe('아빠');
    expect(view.participants.map(p => [p.id, p.isMe])).toEqual([
      [1, true],
      [2, false],
    ]);
    expect(repository.messages).toEqual([]);
  });

  it('같은 사람과 다시 만들면(상대가 먼저 만들었어도) 기존 1:1 방으로 이어진다', async () => {
    const { useCase, repository } = setup();

    const first = await useCase.createRoom(2, { memberIds: [101] });
    const again = await useCase.createRoom(1, { memberIds: [102] });

    expect(again.room.id).toBe(first.room.id);
    expect(repository.rooms).toHaveLength(1);
  });

  it('두 명 이상이면 그룹방 — 다른 공간 사람도 섞을 수 있고, 만든 사람 이름으로 시스템 메시지', async () => {
    const { useCase, repository, emitted } = setup();

    const view = await useCase.createRoom(1, { memberIds: [102, 204], name: ' 명절 준비 ' });

    expect(view.room.type).toBe('group');
    expect(view.room.name).toBe('명절 준비');
    expect(view.title).toBe('명절 준비');
    expect(view.participants.map(p => p.id)).toEqual([1, 2, 4]);
    expect(repository.messages.map(m => [m.type, m.content, m.senderUserId])).toEqual([['system', '엄마님이 대화방을 만들었어요', null]]);
    expect(emitted).toContainEqual({ userIds: [1, 2, 4], event: 'chat:room', payload: { roomId: String(view.room.id) } });
  });

  it('이름 없는 그룹방은 나를 뺀 참여자 이름이 제목', async () => {
    const { useCase } = setup();

    const view = await useCase.createRoom(1, { memberIds: [102, 103] });

    expect(view.title).toBe('아빠, 민수');
  });

  it('내가 속하지 않은 공간의 구성원이 섞이면 거부', async () => {
    const { useCase, repository } = setup();

    await expect(useCase.createRoom(1, { memberIds: [102, 305] })).rejects.toBeInstanceOf(OngiChatInvalidTargets);
    expect(repository.rooms).toEqual([]);
  });

  it('승인 대기 중인 구성원은 초대할 수 없다', async () => {
    const { useCase } = setup();

    await expect(useCase.createRoom(1, { memberIds: [206] })).rejects.toBeInstanceOf(OngiChatInvalidTargets);
  });

  it('없는 구성원 · 나 자신만 고른 경우는 거부', async () => {
    const { useCase } = setup();

    await expect(useCase.createRoom(1, { memberIds: [999] })).rejects.toBeInstanceOf(OngiChatInvalidTargets);
    await expect(useCase.createRoom(1, { memberIds: [101, 201] })).rejects.toBeInstanceOf(OngiChatInvalidTargets);
  });

  it('내가 차단한 사람과는 1:1 도, 그룹방도 만들 수 없다', async () => {
    const { useCase, blocks } = setup();
    blocks.push([1, 2]);

    await expect(useCase.createRoom(1, { memberIds: [102] })).rejects.toBeInstanceOf(OngiChatBlocked);
    await expect(useCase.createRoom(1, { memberIds: [102, 103] })).rejects.toBeInstanceOf(OngiChatBlocked);
  });

  it('방 이름이 30자를 넘으면 거부', async () => {
    const { useCase } = setup();

    await expect(useCase.createRoom(1, { memberIds: [102, 103], name: '가'.repeat(31) })).rejects.toBeInstanceOf(OngiChatInvalidRoomName);
  });
});

describe('OngiChatUseCase.sendMessage — 메시지 보내기', () => {
  it('저장하고 내 읽음 위치를 옮기고, 참여자 전원에게 실시간 · 나를 뺀 참여자에게 채팅 푸시 (알림 목록에는 안 남김)', async () => {
    const { useCase, repository, pushed, emitted } = setup();
    const { room } = await useCase.createRoom(1, { memberIds: [102, 103] });
    emitted.length = 0;

    const view = await useCase.sendMessage(1, room.id, { type: 'text', content: '  저녁 먹자 ' });

    expect(view.message.content).toBe('저녁 먹자');
    expect(view.isMine).toBe(true);
    expect(view.unreadCount).toBe(2);
    expect((await repository.findParticipant(room.id, 1))!.lastReadMessageId).toBe(view.message.id);
    expect(emitted).toEqual([{ userIds: [1, 2, 3], event: 'chat:message', payload: { roomId: String(room.id), messageId: String(view.message.id) } }]);
    expect(pushed).toEqual([
      {
        userId: 2,
        senderUserId: 1,
        title: '엄마, 민수',
        body: '엄마: 저녁 먹자',
        data: { type: 'chat', roomId: String(room.id) },
        category: 'chat',
        inbox: false,
      },
      {
        userId: 3,
        senderUserId: 1,
        title: '엄마, 아빠',
        body: '엄마: 저녁 먹자',
        data: { type: 'chat', roomId: String(room.id) },
        category: 'chat',
        inbox: false,
      },
    ]);
  });

  it('1:1 푸시는 제목이 보낸 사람', async () => {
    const { useCase, pushed } = setup();
    const { room } = await useCase.createRoom(1, { memberIds: [102] });

    await useCase.sendMessage(1, room.id, { type: 'text', content: '밥 먹었어?' });

    expect(pushed.map(p => [p.userId, p.title, p.body])).toEqual([[2, '엄마', '밥 먹었어?']]);
  });

  it('사진 메시지는 온기 업로드 URL 만 — 목록·푸시에는 "사진"', async () => {
    const { useCase, pushed } = setup();
    const { room } = await useCase.createRoom(1, { memberIds: [102] });

    const view = await useCase.sendMessage(1, room.id, { type: 'photo', mediaUrl: PHOTO_URL, thumbUrl: PHOTO_URL });

    expect(view.message.mediaUrl).toBe(PHOTO_URL);
    expect(pushed[0].body).toBe('사진');
    await expect(useCase.sendMessage(1, room.id, { type: 'photo', mediaUrl: 'https://evil.example.com/a.jpg' })).rejects.toBeInstanceOf(OngiChatInvalidMessage);
    await expect(useCase.sendMessage(1, room.id, { type: 'photo', mediaUrl: PHOTO_URL, thumbUrl: 'https://evil.example.com/t.jpg' })).rejects.toBeInstanceOf(
      OngiChatInvalidMessage,
    );
  });

  it('사진 비율(가로/세로)을 저장한다 — 없으면 1, 0.25~4 밖은 잘라낸다', async () => {
    const { useCase } = setup();
    const { room } = await useCase.createRoom(1, { memberIds: [102] });

    const plain = await useCase.sendMessage(1, room.id, { type: 'photo', mediaUrl: PHOTO_URL });
    const wide = await useCase.sendMessage(1, room.id, { type: 'photo', mediaUrl: PHOTO_URL, aspectRatio: 1.5 });
    const tooTall = await useCase.sendMessage(1, room.id, { type: 'photo', mediaUrl: PHOTO_URL, aspectRatio: 0.01 });
    const tooWide = await useCase.sendMessage(1, room.id, { type: 'photo', mediaUrl: PHOTO_URL, aspectRatio: 99 });

    expect([plain, wide, tooTall, tooWide].map(v => v.message.aspectRatio)).toEqual([1, 1.5, 0.25, 4]);
  });

  it('빈 메시지는 거부', async () => {
    const { useCase } = setup();
    const { room } = await useCase.createRoom(1, { memberIds: [102] });

    await expect(useCase.sendMessage(1, room.id, { type: 'text', content: '   ' })).rejects.toBeInstanceOf(OngiChatInvalidMessage);
  });

  it('참여자가 아니면 방이 없는 것처럼', async () => {
    const { useCase } = setup();
    const { room } = await useCase.createRoom(1, { memberIds: [102] });

    await expect(useCase.sendMessage(3, room.id, { type: 'text', content: '안녕' })).rejects.toBeInstanceOf(OngiChatRoomNotFound);
    await expect(useCase.sendMessage(1, 999, { type: 'text', content: '안녕' })).rejects.toBeInstanceOf(OngiChatRoomNotFound);
  });

  it('1:1 에서 어느 한쪽이라도 차단했으면 보낼 수 없다', async () => {
    const { useCase, blocks } = setup();
    const { room } = await useCase.createRoom(1, { memberIds: [102] });

    blocks.push([2, 1]);
    await expect(useCase.sendMessage(1, room.id, { type: 'text', content: '안녕' })).rejects.toBeInstanceOf(OngiChatBlocked);
    await expect(useCase.sendMessage(2, room.id, { type: 'text', content: '안녕' })).rejects.toBeInstanceOf(OngiChatBlocked);
    expect((await useCase.getRoom(1, room.id)).canSend).toBe(false);
  });

  it('상대가 탈퇴한 1:1 방은 보낼 수 없다', async () => {
    const { useCase, repository } = setup();
    const { room } = await useCase.createRoom(1, { memberIds: [102] });
    repository.deletedUserIds.add(2);

    await expect(useCase.sendMessage(1, room.id, { type: 'text', content: '안녕' })).rejects.toBeInstanceOf(OngiChatBlocked);
    expect((await useCase.getRoom(1, room.id)).title).toBe('탈퇴한 사용자');
  });

  it('공간을 나가도 채팅방과 대화는 그대로 — 계속 보고 보낼 수 있다', async () => {
    const { useCase, members } = setup();
    const { room } = await useCase.createRoom(1, { memberIds: [102, 204] });
    members.filter(m => m.userId === 4).forEach(m => (m.deletedAt = new Date()));

    await useCase.sendMessage(4, room.id, { type: 'text', content: '저 공간은 나왔어요' });

    expect((await useCase.getRoom(4, room.id)).participants.map(p => p.id)).toEqual([1, 2, 4]);
    expect((await useCase.scanMessages(1, room.id, null, 30)).map(v => v.message.content)).toEqual(['저 공간은 나왔어요', '엄마님이 대화방을 만들었어요']);
  });
});

describe('OngiChatUseCase.scanMessages — 메시지 목록', () => {
  it('최신 순, 메시지마다 안 읽은 사람 수 — 읽으면 줄어든다', async () => {
    const { useCase } = setup();
    const { room } = await useCase.createRoom(1, { memberIds: [102, 103] });
    const a = await useCase.sendMessage(1, room.id, { type: 'text', content: '하나' });
    await useCase.sendMessage(1, room.id, { type: 'text', content: '둘' });

    await useCase.read(2, room.id, a.message.id);
    const views = await useCase.scanMessages(1, room.id, null, 30);

    expect(views.map(v => [v.message.content, v.unreadCount, v.isMine, v.sender?.name ?? null])).toEqual([
      ['둘', 2, true, '엄마'],
      ['하나', 1, true, '엄마'],
      ['엄마님이 대화방을 만들었어요', 0, false, null],
    ]);
  });

  it('beforeId 로 이전 메시지를 이어서 불러온다', async () => {
    const { useCase } = setup();
    const { room } = await useCase.createRoom(1, { memberIds: [102] });
    const first = await useCase.sendMessage(1, room.id, { type: 'text', content: '1' });
    await useCase.sendMessage(1, room.id, { type: 'text', content: '2' });
    const third = await useCase.sendMessage(1, room.id, { type: 'text', content: '3' });

    expect((await useCase.scanMessages(2, room.id, third.message.id, 1)).map(v => v.message.content)).toEqual(['2']);
    expect((await useCase.scanMessages(2, room.id, first.message.id, 30)).map(v => v.message.content)).toEqual([]);
  });

  it('내가 차단한 사람의 메시지는 그룹방에서도 보이지 않는다', async () => {
    const { useCase, blocks } = setup();
    const { room } = await useCase.createRoom(1, { memberIds: [102, 103] });
    await useCase.sendMessage(2, room.id, { type: 'text', content: '아빠 메시지' });
    await useCase.sendMessage(3, room.id, { type: 'text', content: '민수 메시지' });
    blocks.push([1, 2]);

    expect((await useCase.scanMessages(1, room.id, null, 30)).map(v => v.message.content)).toEqual(['민수 메시지', '엄마님이 대화방을 만들었어요']);
  });
});

describe('OngiChatUseCase.read — 읽음 처리', () => {
  it('읽음 위치를 옮기고 참여자들에게 실시간으로 알린다', async () => {
    const { useCase, repository, emitted } = setup();
    const { room } = await useCase.createRoom(1, { memberIds: [102] });
    const sent = await useCase.sendMessage(1, room.id, { type: 'text', content: '안녕' });
    emitted.length = 0;

    await useCase.read(2, room.id, sent.message.id);

    expect((await repository.findParticipant(room.id, 2))!.lastReadMessageId).toBe(sent.message.id);
    expect(emitted).toEqual([{ userIds: [1, 2], event: 'chat:read', payload: { roomId: String(room.id) } }]);
    expect(await useCase.countUnread(2)).toBe(0);
  });

  it('방의 마지막 메시지보다 큰 id 는 마지막 메시지까지만', async () => {
    const { useCase, repository } = setup();
    const { room } = await useCase.createRoom(1, { memberIds: [102] });
    const sent = await useCase.sendMessage(1, room.id, { type: 'text', content: '안녕' });

    await useCase.read(2, room.id, 99999);

    expect((await repository.findParticipant(room.id, 2))!.lastReadMessageId).toBe(sent.message.id);
  });
});

describe('OngiChatUseCase.invite — 그룹방 초대 (참여자 누구나)', () => {
  it('만든 사람이 아니어도 초대할 수 있고, 초대된 사람은 초대 전 메시지를 볼 수 없다', async () => {
    const { useCase } = setup();
    const { room } = await useCase.createRoom(1, { memberIds: [102, 103] });
    await useCase.sendMessage(1, room.id, { type: 'text', content: '초대 전 이야기' });

    // 아빠(2)는 외가(20) 구성원이 아니므로, 외가에도 있는 엄마(1)가 수진(204)을 초대
    await expect(useCase.invite(2, room.id, [204])).rejects.toBeInstanceOf(OngiChatInvalidTargets);
    const view = await useCase.invite(1, room.id, [204]);

    expect(view.participants.map(p => p.id)).toEqual([1, 2, 3, 4]);
    expect((await useCase.scanMessages(4, room.id, null, 30)).map(v => v.message.content)).toEqual(['엄마님이 수진님을 초대했어요']);
  });

  it('참여자 누구나 — 민수(만든 사람 아님)가 같은 공간의 아빠를 다시 초대할 수 있다', async () => {
    const { useCase } = setup();
    const { room } = await useCase.createRoom(1, { memberIds: [102, 103] });
    await useCase.leave(2, room.id);

    const view = await useCase.invite(3, room.id, [102]);

    expect(view.participants.map(p => p.id)).toEqual([1, 2, 3]);
  });

  it('이미 참여 중인 사람만 고르면 아무 일도 없다', async () => {
    const { useCase, repository } = setup();
    const { room } = await useCase.createRoom(1, { memberIds: [102, 103] });
    const before = repository.messages.length;

    await useCase.invite(1, room.id, [102]);

    expect(repository.messages).toHaveLength(before);
  });

  it('1:1 방에는 초대할 수 없다', async () => {
    const { useCase } = setup();
    const { room } = await useCase.createRoom(1, { memberIds: [102] });

    await expect(useCase.invite(1, room.id, [103])).rejects.toBeInstanceOf(OngiChatNotGroupRoom);
  });
});

describe('OngiChatUseCase.leave — 나가기', () => {
  it('그룹방은 나가면 "OO님이 나갔어요" 가 남고, 나간 사람 목록에서 사라지고 들어갈 수 없다', async () => {
    const { useCase, repository, pushed } = setup();
    const { room } = await useCase.createRoom(1, { memberIds: [102, 103] });

    await useCase.leave(2, room.id);

    expect(repository.messages.map(m => m.content)).toEqual(['엄마님이 대화방을 만들었어요', '아빠님이 나갔어요']);
    expect(await useCase.scanRooms(2)).toEqual([]);
    await expect(useCase.getRoom(2, room.id)).rejects.toBeInstanceOf(OngiChatRoomNotFound);

    await useCase.sendMessage(1, room.id, { type: 'text', content: '아빠 없이' });
    expect(pushed.map(p => p.userId)).toEqual([3]);
  });

  it('1:1 방은 내 목록에서만 지워지고, 상대가 새로 보내면 다시 나타난다 (지운 대화는 안 보임)', async () => {
    const { useCase } = setup();
    const { room } = await useCase.createRoom(1, { memberIds: [102] });
    await useCase.sendMessage(2, room.id, { type: 'text', content: '예전 이야기' });

    await useCase.leave(1, room.id);
    expect(await useCase.scanRooms(1)).toEqual([]);
    expect((await useCase.scanRooms(2)).map(v => v.room.id)).toEqual([room.id]);

    await useCase.sendMessage(2, room.id, { type: 'text', content: '새 이야기' });
    const [row] = await useCase.scanRooms(1);
    expect(row.unreadCount).toBe(1);
    expect(row.lastMessage?.content).toBe('새 이야기');
    expect((await useCase.scanMessages(1, room.id, null, 30)).map(v => v.message.content)).toEqual(['새 이야기']);
  });
});

describe('OngiChatUseCase.scanRooms — 내 대화방 목록', () => {
  it('마지막 메시지 최신 순, 안 읽은 수 · 제목과 함께', async () => {
    const { useCase } = setup();
    const direct = await useCase.createRoom(1, { memberIds: [102] });
    const group = await useCase.createRoom(1, { memberIds: [103, 204], name: '사촌 모임' });
    await useCase.sendMessage(2, direct.room.id, { type: 'text', content: '아빠야' });
    await useCase.sendMessage(3, group.room.id, { type: 'text', content: '하나' });
    await useCase.sendMessage(4, group.room.id, { type: 'text', content: '둘' });

    const rooms = await useCase.scanRooms(1);

    expect(rooms.map(v => [v.title, v.unreadCount, v.lastMessage?.content])).toEqual([
      ['사촌 모임', 2, '둘'],
      ['아빠', 1, '아빠야'],
    ]);
    expect(await useCase.countUnread(1)).toBe(3);
  });
});
