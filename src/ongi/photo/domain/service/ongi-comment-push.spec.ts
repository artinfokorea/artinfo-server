import { commentPushTargets } from '@/ongi/photo/domain/service/ongi-comment-push';

/** 구성원 id: 1=사진 작성자. groupMemberIds 는 살아있는 가족 전원 (그룹 순서) */
const targets = (params: { groupMemberIds: number[]; photoAuthorMemberId: number; existingCommenterMemberIds: number[]; actorMemberId: number }) =>
  commentPushTargets(params);

describe('commentPushTargets — 댓글 푸시를 받을 사람 (가족 전원)', () => {
  it('댓글에 참여한 적 없는 가족에게도 간다 — 작성자 → 댓글 참여자 → 나머지 가족 순서', () => {
    expect(targets({ groupMemberIds: [1, 2, 3, 4, 5], photoAuthorMemberId: 1, existingCommenterMemberIds: [3], actorMemberId: 5 })).toEqual([
      { memberId: 1, role: 'author' },
      { memberId: 3, role: 'participant' },
      { memberId: 2, role: 'member' },
      { memberId: 4, role: 'member' },
    ]);
  });

  it('두 명뿐인 가족에서 남의 사진에 첫 댓글 — 작성자에게만 간다', () => {
    expect(targets({ groupMemberIds: [1, 2], photoAuthorMemberId: 1, existingCommenterMemberIds: [], actorMemberId: 2 })).toEqual([
      { memberId: 1, role: 'author' },
    ]);
  });

  it('내 사진에 내가 단 첫 댓글 — 나머지 가족에게 간다, 나는 제외', () => {
    expect(targets({ groupMemberIds: [1, 2, 3], photoAuthorMemberId: 1, existingCommenterMemberIds: [], actorMemberId: 1 })).toEqual([
      { memberId: 2, role: 'member' },
      { memberId: 3, role: 'member' },
    ]);
  });

  it('혼자인 가족은 아무에게도 안 간다', () => {
    expect(targets({ groupMemberIds: [1], photoAuthorMemberId: 1, existingCommenterMemberIds: [], actorMemberId: 1 })).toEqual([]);
  });

  it('방금 댓글을 단 본인은 이미 댓글을 단 적이 있어도 제외된다', () => {
    expect(targets({ groupMemberIds: [1, 2, 3], photoAuthorMemberId: 1, existingCommenterMemberIds: [2, 3, 2], actorMemberId: 2 })).toEqual([
      { memberId: 1, role: 'author' },
      { memberId: 3, role: 'participant' },
    ]);
  });

  it('같은 사람이 여러 번 댓글을 달았어도 푸시는 한 번', () => {
    expect(targets({ groupMemberIds: [1, 2, 3], photoAuthorMemberId: 1, existingCommenterMemberIds: [3, 3, 3], actorMemberId: 2 })).toEqual([
      { memberId: 1, role: 'author' },
      { memberId: 3, role: 'participant' },
    ]);
  });

  it('작성자가 자기 사진에 댓글도 달았으면 작성자 문구로 한 번만 간다', () => {
    expect(targets({ groupMemberIds: [1, 2, 3], photoAuthorMemberId: 1, existingCommenterMemberIds: [1, 3], actorMemberId: 2 })).toEqual([
      { memberId: 1, role: 'author' },
      { memberId: 3, role: 'participant' },
    ]);
  });

  it('작성자가 방금 댓글을 단 사람이면 작성자 푸시는 빠지고 참여자·가족에게 간다', () => {
    expect(targets({ groupMemberIds: [1, 2, 3], photoAuthorMemberId: 1, existingCommenterMemberIds: [2], actorMemberId: 1 })).toEqual([
      { memberId: 2, role: 'participant' },
      { memberId: 3, role: 'member' },
    ]);
  });

  it('가족에서 나간 사람은 댓글을 달았었어도 받지 않는다 (groupMemberIds 에 없는 id)', () => {
    expect(targets({ groupMemberIds: [1, 3], photoAuthorMemberId: 1, existingCommenterMemberIds: [2], actorMemberId: 3 })).toEqual([
      { memberId: 1, role: 'author' },
    ]);
  });

  it('사진 작성자가 가족에서 나갔으면 작성자 푸시는 빠진다', () => {
    expect(targets({ groupMemberIds: [2, 3], photoAuthorMemberId: 1, existingCommenterMemberIds: [], actorMemberId: 3 })).toEqual([
      { memberId: 2, role: 'member' },
    ]);
  });
});
