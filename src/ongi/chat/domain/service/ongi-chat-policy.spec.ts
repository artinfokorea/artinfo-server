import {
  chatPushOf,
  directKeyOf,
  invitedSystemText,
  inviteTargetsOf,
  isOngiMediaUrl,
  leftSystemText,
  createdSystemText,
  messagePreviewOf,
  normalizeChatText,
  normalizeRoomName,
  ONGI_CHAT_TEXT_MAX_LENGTH,
  roomTitleOf,
  unreadCountOf,
} from '@/ongi/chat/domain/service/ongi-chat-policy';

describe('normalizeChatText — 메시지 본문', () => {
  it('앞뒤 공백을 걷어낸다 (가운데 줄바꿈은 유지)', () => {
    expect(normalizeChatText('  밥 먹었어?\n응 \n')).toBe('밥 먹었어?\n응');
  });

  it('비었거나 공백뿐이면 null', () => {
    expect(normalizeChatText('')).toBeNull();
    expect(normalizeChatText(' \n\t ')).toBeNull();
    expect(normalizeChatText(undefined)).toBeNull();
    expect(normalizeChatText(null)).toBeNull();
  });

  it('최대 1000자, 넘으면 null', () => {
    expect(ONGI_CHAT_TEXT_MAX_LENGTH).toBe(1000);
    expect(normalizeChatText('가'.repeat(1000))).toBe('가'.repeat(1000));
    expect(normalizeChatText('가'.repeat(1001))).toBeNull();
  });
});

describe('normalizeRoomName — 그룹방 이름 (선택)', () => {
  it('비우면 이름 없음(null) — 참여자 이름으로 표시된다', () => {
    expect(normalizeRoomName(undefined)).toEqual({ name: null });
    expect(normalizeRoomName('   ')).toEqual({ name: null });
  });

  it('앞뒤 공백을 걷어낸다', () => {
    expect(normalizeRoomName('  사촌 모임 ')).toEqual({ name: '사촌 모임' });
  });

  it('30자까지, 넘으면 거부(null)', () => {
    expect(normalizeRoomName('가'.repeat(30))).toEqual({ name: '가'.repeat(30) });
    expect(normalizeRoomName('가'.repeat(31))).toBeNull();
  });
});

describe('directKeyOf — 두 사람의 1:1 방은 하나뿐', () => {
  it('작은 id 가 앞 — 누가 먼저 만들어도 같은 키', () => {
    expect(directKeyOf(7, 3)).toBe('3:7');
    expect(directKeyOf(3, 7)).toBe('3:7');
  });
});

describe('inviteTargetsOf — 고른 구성원을 초대할 사용자로', () => {
  it('내가 속한 공간의 구성원이면 사용자 id 로 바꾼다 (다른 공간끼리 섞여도 된다)', () => {
    const result = inviteTargetsOf(
      1,
      [
        { userId: 2, groupId: 10 },
        { userId: 5, groupId: 20 },
      ],
      [10, 20],
    );

    expect(result).toEqual({ userIds: [2, 5], outsider: false });
  });

  it('같은 사람이 여러 공간에 있어 두 번 골라도 한 번만', () => {
    const result = inviteTargetsOf(
      1,
      [
        { userId: 2, groupId: 10 },
        { userId: 2, groupId: 20 },
      ],
      [10, 20],
    );

    expect(result).toEqual({ userIds: [2], outsider: false });
  });

  it('나 자신은 빠진다', () => {
    expect(
      inviteTargetsOf(
        1,
        [
          { userId: 1, groupId: 10 },
          { userId: 2, groupId: 10 },
        ],
        [10],
      ),
    ).toEqual({ userIds: [2], outsider: false });
  });

  it('내가 속하지 않은 공간의 구성원이 섞여 있으면 outsider', () => {
    expect(
      inviteTargetsOf(
        1,
        [
          { userId: 2, groupId: 10 },
          { userId: 9, groupId: 99 },
        ],
        [10],
      ).outsider,
    ).toBe(true);
  });
});

describe('unreadCountOf — 메시지 옆 안 읽은 사람 수', () => {
  const base = { lastReadMessageId: 0, visibleFromMessageId: 0, left: false };

  it('보낸 사람을 뺀 참여자 중 아직 안 읽은 사람 수', () => {
    const participants = [
      { ...base, userId: 1, lastReadMessageId: 100 },
      { ...base, userId: 2, lastReadMessageId: 99 },
      { ...base, userId: 3, lastReadMessageId: 100 },
      { ...base, userId: 4, lastReadMessageId: 50 },
    ];

    expect(unreadCountOf({ id: 100, senderUserId: 1 }, participants)).toBe(2);
  });

  it('나간 사람은 세지 않는다', () => {
    const participants = [
      { ...base, userId: 1, lastReadMessageId: 100 },
      { ...base, userId: 2, lastReadMessageId: 0, left: true },
    ];

    expect(unreadCountOf({ id: 100, senderUserId: 1 }, participants)).toBe(0);
  });

  it('메시지 뒤에 초대된 사람은 그 메시지를 볼 수 없으니 세지 않는다', () => {
    const participants = [
      { ...base, userId: 1, lastReadMessageId: 100 },
      { ...base, userId: 2, lastReadMessageId: 120, visibleFromMessageId: 120 },
      { ...base, userId: 3, lastReadMessageId: 99, visibleFromMessageId: 99 },
    ];

    expect(unreadCountOf({ id: 100, senderUserId: 1 }, participants)).toBe(1);
  });

  it('시스템 메시지(보낸 사람 없음)는 0', () => {
    expect(unreadCountOf({ id: 100, senderUserId: null }, [{ ...base, userId: 2 }])).toBe(0);
  });
});

describe('roomTitleOf — 방 제목', () => {
  it('이름을 정했으면 그 이름', () => {
    expect(roomTitleOf('사촌 모임', ['엄마', '아빠'])).toBe('사촌 모임');
  });

  it('이름이 없으면 나를 뺀 참여자 이름 (3명까지)', () => {
    expect(roomTitleOf(null, ['엄마'])).toBe('엄마');
    expect(roomTitleOf(null, ['엄마', '아빠', '민수'])).toBe('엄마, 아빠, 민수');
  });

  it('4명 이상이면 "외 N명"', () => {
    expect(roomTitleOf(null, ['엄마', '아빠', '민수', '할머니', '수진'])).toBe('엄마, 아빠, 민수 외 2명');
  });

  it('다 나가고 나만 남으면 "대화 상대 없음"', () => {
    expect(roomTitleOf(null, [])).toBe('대화 상대 없음');
  });
});

describe('messagePreviewOf — 목록·푸시에 보일 한 줄', () => {
  it('글은 그대로, 사진은 "사진"', () => {
    expect(messagePreviewOf('text', '주말에 봐~')).toBe('주말에 봐~');
    expect(messagePreviewOf('photo', '')).toBe('사진');
    expect(messagePreviewOf('system', '민수님이 나갔어요')).toBe('민수님이 나갔어요');
  });

  it('줄바꿈은 공백으로, 100자 넘으면 자르고 …', () => {
    expect(messagePreviewOf('text', '첫 줄\n둘째 줄')).toBe('첫 줄 둘째 줄');
    expect(messagePreviewOf('text', '가'.repeat(101))).toBe(`${'가'.repeat(100)}…`);
  });
});

describe('chatPushOf — 새 메시지 푸시 문구', () => {
  it('1:1 은 제목이 보낸 사람, 본문이 내용', () => {
    expect(chatPushOf({ roomType: 'direct', roomTitle: '엄마', senderName: '엄마', messageType: 'text', content: '밥 먹었니' })).toEqual({
      title: '엄마',
      body: '밥 먹었니',
    });
  });

  it('그룹은 제목이 방 제목, 본문이 "보낸 사람: 내용"', () => {
    expect(chatPushOf({ roomType: 'group', roomTitle: '사촌 모임', senderName: '지현', messageType: 'photo', content: '' })).toEqual({
      title: '사촌 모임',
      body: '지현: 사진',
    });
  });
});

describe('시스템 메시지 문구', () => {
  it('방 만들기 · 초대 · 나가기', () => {
    expect(createdSystemText('엄마')).toBe('엄마님이 대화방을 만들었어요');
    expect(invitedSystemText('민수', ['수진', '지현'])).toBe('민수님이 수진님, 지현님을 초대했어요');
    expect(leftSystemText('아빠')).toBe('아빠님이 나갔어요');
  });
});

describe('isOngiMediaUrl — 사진 메시지는 우리 버킷의 온기 경로만', () => {
  it('온기 업로드 URL 은 허용', () => {
    expect(isOngiMediaUrl('https://artinfo.s3.ap-northeast-2.amazonaws.com/ongi/photos/2026/09/a.jpg')).toBe(true);
  });

  it('외부 URL · 다른 경로 · http 는 거부', () => {
    expect(isOngiMediaUrl('https://evil.example.com/ongi/a.jpg')).toBe(false);
    expect(isOngiMediaUrl('https://artinfo.s3.ap-northeast-2.amazonaws.com/azeyo/a.jpg')).toBe(false);
    expect(isOngiMediaUrl('http://artinfo.s3.ap-northeast-2.amazonaws.com/ongi/a.jpg')).toBe(false);
    expect(isOngiMediaUrl('')).toBe(false);
  });
});
