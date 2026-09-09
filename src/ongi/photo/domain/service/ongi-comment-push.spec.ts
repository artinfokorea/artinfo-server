import { commentPushTargets } from '@/ongi/photo/domain/service/ongi-comment-push';

/** 구성원 id: 1=사진 작성자, 그 외는 댓글 참여자 */
const targets = (params: { photoAuthorMemberId: number; existingCommenterMemberIds: number[]; actorMemberId: number }) => commentPushTargets(params);

describe('commentPushTargets — 댓글 푸시를 받을 사람', () => {
  it('사진 작성자에게 간다', () => {
    expect(targets({ photoAuthorMemberId: 1, existingCommenterMemberIds: [], actorMemberId: 2 })).toEqual([{ memberId: 1, isPhotoAuthor: true }]);
  });

  it('내 사진에 내가 단 첫 댓글은 아무에게도 안 간다', () => {
    expect(targets({ photoAuthorMemberId: 1, existingCommenterMemberIds: [], actorMemberId: 1 })).toEqual([]);
  });

  it('이미 한마디를 남긴 사람들에게도 간다 — 작성자 먼저, 그다음 댓글 단 순서', () => {
    expect(targets({ photoAuthorMemberId: 1, existingCommenterMemberIds: [2, 3], actorMemberId: 4 })).toEqual([
      { memberId: 1, isPhotoAuthor: true },
      { memberId: 2, isPhotoAuthor: false },
      { memberId: 3, isPhotoAuthor: false },
    ]);
  });

  it('방금 댓글을 단 본인은 이미 댓글을 단 적이 있어도 제외된다', () => {
    expect(targets({ photoAuthorMemberId: 1, existingCommenterMemberIds: [2, 3, 2], actorMemberId: 2 })).toEqual([
      { memberId: 1, isPhotoAuthor: true },
      { memberId: 3, isPhotoAuthor: false },
    ]);
  });

  it('같은 사람이 여러 번 댓글을 달았어도 푸시는 한 번', () => {
    expect(targets({ photoAuthorMemberId: 1, existingCommenterMemberIds: [3, 3, 3], actorMemberId: 2 })).toEqual([
      { memberId: 1, isPhotoAuthor: true },
      { memberId: 3, isPhotoAuthor: false },
    ]);
  });

  it('작성자가 자기 사진에 댓글도 달았으면 작성자 문구로 한 번만 간다', () => {
    expect(targets({ photoAuthorMemberId: 1, existingCommenterMemberIds: [1, 3], actorMemberId: 2 })).toEqual([
      { memberId: 1, isPhotoAuthor: true },
      { memberId: 3, isPhotoAuthor: false },
    ]);
  });

  it('내가 쓴 사진에 내가 댓글을 달아 뒀고 남이 댓글을 달면 나에게 간다', () => {
    expect(targets({ photoAuthorMemberId: 1, existingCommenterMemberIds: [1], actorMemberId: 5 })).toEqual([{ memberId: 1, isPhotoAuthor: true }]);
  });

  it('내가 댓글만 달았던 남의 사진에 또 다른 사람이 댓글을 달면 나에게 간다', () => {
    expect(targets({ photoAuthorMemberId: 9, existingCommenterMemberIds: [1], actorMemberId: 5 })).toEqual([
      { memberId: 9, isPhotoAuthor: true },
      { memberId: 1, isPhotoAuthor: false },
    ]);
  });

  it('작성자가 방금 댓글을 단 사람이면 작성자 푸시는 빠지고 참여자에게만 간다', () => {
    expect(targets({ photoAuthorMemberId: 1, existingCommenterMemberIds: [2], actorMemberId: 1 })).toEqual([{ memberId: 2, isPhotoAuthor: false }]);
  });
});
