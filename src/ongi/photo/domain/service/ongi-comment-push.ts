export interface OngiCommentPushTarget {
  /** 알림을 받을 구성원 id */
  memberId: number;
  /** 사진 작성자인지 — 알림 문구가 다르다 */
  isPhotoAuthor: boolean;
}

/**
 * 댓글 푸시를 받을 사람을 고른다 — 사진 작성자 + 이 사진에 이미 한마디를 남긴 사람들.
 *
 * 대화에 참여한 사람은 뒤이은 댓글을 알 수 있어야 한다. 방금 댓글을 단 본인은 제외하고,
 * 같은 사람에게는 한 번만 (작성자이면서 댓글도 달았으면 작성자 문구 하나로).
 * 순서는 작성자 → 댓글을 단 순서.
 */
export function commentPushTargets(params: {
  photoAuthorMemberId: number;
  /** 이 사진의 기존 댓글 작성자 구성원 id — 오래된 순, 중복 허용 */
  existingCommenterMemberIds: number[];
  /** 방금 댓글을 단 구성원 id */
  actorMemberId: number;
}): OngiCommentPushTarget[] {
  const targets: OngiCommentPushTarget[] = [];
  const seen = new Set<number>([params.actorMemberId]);

  if (!seen.has(params.photoAuthorMemberId)) {
    seen.add(params.photoAuthorMemberId);
    targets.push({ memberId: params.photoAuthorMemberId, isPhotoAuthor: true });
  }

  for (const memberId of params.existingCommenterMemberIds) {
    if (seen.has(memberId)) continue;
    seen.add(memberId);
    targets.push({ memberId, isPhotoAuthor: false });
  }

  return targets;
}
