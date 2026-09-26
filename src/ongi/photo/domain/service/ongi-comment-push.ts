/** 댓글 푸시 수신자의 입장 — 문구가 다르다 */
export type OngiCommentPushRole = 'author' | 'participant' | 'member';

export interface OngiCommentPushTarget {
  /** 알림을 받을 구성원 id */
  memberId: number;
  /** author=사진 작성자 · participant=이미 한마디를 남긴 사람 · member=그 외 가족 */
  role: OngiCommentPushRole;
}

/**
 * 댓글 푸시를 받을 사람을 고른다 — 살아있는 가족 전원 (방금 댓글을 단 본인 제외).
 *
 * 가족 공간은 소규모라 댓글은 가족 대화에 가깝다. 대화에 아직 끼지 않은 가족도 알 수 있어야 한다.
 * 같은 사람에게는 한 번만 (작성자이면서 댓글도 달았으면 작성자 문구 하나로).
 * 순서는 작성자 → 댓글을 단 순서 → 나머지 가족(그룹 순서). groupMemberIds 에 없는 사람(나간 구성원)은 받지 않는다.
 */
export function commentPushTargets(params: {
  /** 살아있는 가족 구성원 id — 그룹 순서 */
  groupMemberIds: number[];
  photoAuthorMemberId: number;
  /** 이 사진의 기존 댓글 작성자 구성원 id — 오래된 순, 중복 허용 */
  existingCommenterMemberIds: number[];
  /** 방금 댓글을 단 구성원 id */
  actorMemberId: number;
}): OngiCommentPushTarget[] {
  const alive = new Set(params.groupMemberIds);
  const targets: OngiCommentPushTarget[] = [];
  const seen = new Set<number>([params.actorMemberId]);

  const add = (memberId: number, role: OngiCommentPushRole) => {
    if (seen.has(memberId) || !alive.has(memberId)) return;
    seen.add(memberId);
    targets.push({ memberId, role });
  };

  add(params.photoAuthorMemberId, 'author');
  for (const memberId of params.existingCommenterMemberIds) add(memberId, 'participant');
  for (const memberId of params.groupMemberIds) add(memberId, 'member');

  return targets;
}
