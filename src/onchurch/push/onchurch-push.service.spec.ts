import { OnchurchPushService, PushMessage } from '@/onchurch/push/onchurch-push.service';
import { OnchurchPushRepository } from '@/onchurch/push/onchurch-push.repository';
import { OnchurchExpoPushSender } from '@/onchurch/push/onchurch-expo-push.sender';

/**
 * 교회 10 '새벽교회' — 기기: 1 관리자(작성자) A, 2 김성도 B, 3 이성도 C (알림 끔은 저장소 쿼리가 거른다)
 * 기대:
 * - 관리자가 공지·설교·앨범을 올리면 작성자를 뺀 교회 사람들에게 "[공지] 제목" 같은 알림이 간다 (탭하면 해당 목록으로)
 * - 숨김(비활성) 글, 예약 공지(게시 시각이 미래)는 보내지 않는다
 * - 교제 글은 작성자를 뺀 교회 사람들에게, 댓글은 글쓴이에게만 간다 (내 글에 내가 단 댓글은 보내지 않는다)
 * - 긴 내용은 80자에서 자르고 … 을 붙인다
 * - 죽은 토큰은 지우고, 발송이 실패해도 예외를 던지지 않는다 (글 작성은 성공해야 한다)
 */
function build(options: { sendFails?: boolean; stale?: string[] } = {}) {
  const sent: { tokens: string[]; message: PushMessage }[] = [];
  const deleted: string[][] = [];
  const churchCalls: { churchId: number; excludeUserId: number }[] = [];
  const userCalls: { userId: number; fromUserId: number }[] = [];
  const repository = {
    findChurchName: async (churchId: number) => (churchId === 10 ? '새벽교회' : null),
    scanChurchTokens: async (churchId: number, excludeUserId: number) => {
      churchCalls.push({ churchId, excludeUserId });
      return ['ExponentPushToken[B]', 'ExponentPushToken[C]'];
    },
    scanUserTokens: async (userId: number, fromUserId: number) => {
      userCalls.push({ userId, fromUserId });
      return userId === 2 ? ['ExponentPushToken[B]'] : [];
    },
    deleteTokens: async (tokens: string[]) => {
      deleted.push(tokens);
    },
  } as unknown as OnchurchPushRepository;
  const sender = {
    send: async (tokens: string[], message: PushMessage) => {
      if (options.sendFails) throw new Error('expo down');
      sent.push({ tokens, message });
      return { sent: tokens.length, stale: options.stale ?? [] };
    },
  } as unknown as OnchurchExpoPushSender;
  return { service: new OnchurchPushService(repository, sender), sent, deleted, churchCalls, userCalls };
}

describe('OnchurchPushService', () => {
  it('관리자가 공지를 올리면 작성자를 뺀 교회 사람들에게 보낸다', async () => {
    const { service, sent, churchCalls } = build();
    const count = await service.notifyChurchPost({ churchId: 10, authorId: 1, kind: 'notice', title: '성탄 예배 안내' });
    expect(count).toBe(2);
    expect(churchCalls).toEqual([{ churchId: 10, excludeUserId: 1 }]);
    expect(sent).toEqual([
      {
        tokens: ['ExponentPushToken[B]', 'ExponentPushToken[C]'],
        message: { title: '새벽교회', body: '[공지] 성탄 예배 안내', data: { type: 'notice', path: '/notices' } },
      },
    ]);
  });

  it('설교·앨범은 각 목록으로 연결된다', async () => {
    const { service, sent } = build();
    await service.notifyChurchPost({ churchId: 10, authorId: 1, kind: 'sermon', title: '은혜의 강가로' });
    await service.notifyChurchPost({ churchId: 10, authorId: 1, kind: 'gallery', title: '여름 수련회' });
    expect(sent.map(s => s.message)).toEqual([
      { title: '새벽교회', body: '[설교] 은혜의 강가로', data: { type: 'sermon', path: '/sermons' } },
      { title: '새벽교회', body: '[앨범] 여름 수련회', data: { type: 'gallery', path: '/gallery' } },
    ]);
  });

  it('숨김 글과 예약 공지는 보내지 않는다', async () => {
    const { service, sent } = build();
    const now = new Date('2026-11-23T10:00:00Z');
    expect(await service.notifyChurchPost({ churchId: 10, authorId: 1, kind: 'sermon', title: '숨김', isActive: false })).toBe(0);
    expect(
      await service.notifyChurchPost({ churchId: 10, authorId: 1, kind: 'notice', title: '예약', publishedAt: new Date('2026-11-24T00:00:00Z'), now }),
    ).toBe(0);
    expect(sent).toEqual([]);
  });

  it('게시 시각이 지금이거나 지났으면 보낸다', async () => {
    const { service, sent } = build();
    const now = new Date('2026-11-23T10:00:00Z');
    await service.notifyChurchPost({ churchId: 10, authorId: 1, kind: 'notice', title: '바로 게시', publishedAt: new Date('2026-11-23T10:00:00Z'), now });
    expect(sent).toHaveLength(1);
  });

  it('교제 글은 작성자를 뺀 교회 사람들에게 보내고, 탭하면 그 글이 열린다', async () => {
    const { service, sent, churchCalls } = build();
    await service.notifyCommunityPost({ churchId: 10, authorId: 2, authorName: '김성도', postId: 7, title: '감사 나눔' });
    expect(churchCalls).toEqual([{ churchId: 10, excludeUserId: 2 }]);
    expect(sent[0].message).toEqual({
      title: '새벽교회',
      body: '김성도님이 교제 글을 올렸어요: 감사 나눔',
      data: { type: 'community', path: '/community?post=7' },
    });
  });

  it('댓글은 글쓴이에게만 보낸다', async () => {
    const { service, sent, userCalls } = build();
    const count = await service.notifyCommunityComment({
      churchId: 10,
      postId: 7,
      postAuthorId: 2,
      commenterId: 3,
      commenterName: '이성도',
      content: '은혜받았습니다',
    });
    expect(count).toBe(1);
    expect(userCalls).toEqual([{ userId: 2, fromUserId: 3 }]);
    expect(sent).toEqual([
      {
        tokens: ['ExponentPushToken[B]'],
        message: { title: '새벽교회', body: '이성도님이 댓글을 남겼어요: 은혜받았습니다', data: { type: 'community', path: '/community?post=7' } },
      },
    ]);
  });

  it('내 글에 내가 단 댓글은 보내지 않는다', async () => {
    const { service, sent, userCalls } = build();
    const count = await service.notifyCommunityComment({
      churchId: 10,
      postId: 7,
      postAuthorId: 2,
      commenterId: 2,
      commenterName: '김성도',
      content: '추가로',
    });
    expect(count).toBe(0);
    expect(userCalls).toEqual([]);
    expect(sent).toEqual([]);
  });

  it('긴 내용은 80자에서 자르고 … 을 붙인다', async () => {
    const { service, sent } = build();
    await service.notifyCommunityComment({ churchId: 10, postId: 7, postAuthorId: 2, commenterId: 3, commenterName: '이성도', content: '가'.repeat(100) });
    expect(sent[0].message.body).toBe(`이성도님이 댓글을 남겼어요: ${'가'.repeat(80)}…`);
  });

  it('교회 이름이 없으면 제목을 "온교회"로 보낸다', async () => {
    const { service, sent } = build();
    await service.notifyChurchPost({ churchId: 99, authorId: 1, kind: 'notice', title: '안내' });
    expect(sent[0].message.title).toBe('온교회');
  });

  it('죽은 토큰은 지운다', async () => {
    const { service, deleted } = build({ stale: ['ExponentPushToken[C]'] });
    await service.notifyChurchPost({ churchId: 10, authorId: 1, kind: 'notice', title: '안내' });
    expect(deleted).toEqual([['ExponentPushToken[C]']]);
  });

  it('발송이 실패해도 예외를 던지지 않고 0을 돌려준다', async () => {
    const { service } = build({ sendFails: true });
    await expect(service.notifyChurchPost({ churchId: 10, authorId: 1, kind: 'notice', title: '안내' })).resolves.toBe(0);
  });
});
