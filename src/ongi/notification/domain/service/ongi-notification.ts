/** 앱 내 알림 목록 보관 기간 — 이보다 오래된 행은 목록에서 빠지고 매일 지운다 */
export const NOTIFICATION_RETENTION_DAYS = 30;

export interface OngiNotificationCreator {
  userId: number;
  /** 푸시 data.type 과 같다 — photo · comment · like · event_* · member_joined · inquiry_answered · system */
  type: string;
  title: string;
  body: string;
  /** 앱이 탭 시 이동에 쓰는 페이로드 (푸시 data 그대로) */
  data: Record<string, string>;
  /** 행위자(사진 올린 사람 등) — 시스템 알림은 null */
  actorUserId: number | null;
}

/**
 * 푸시 한 건을 수신자별 알림 행으로 바꾼다 — 행위자 본인 제외, 같은 사람은 한 번만.
 * 푸시 종류별 수신 설정과 무관하게 저장한다 (설정은 "울릴지"만 정하고 목록에는 다 남는다).
 */
export function notificationRecordsOf(
  message: { title: string; body: string; data?: Record<string, string> },
  recipientUserIds: number[],
  actorUserId: number | null,
): OngiNotificationCreator[] {
  const data = message.data ?? {};
  const type = data.type || 'system';
  const seen = new Set<number>(actorUserId === null ? [] : [actorUserId]);
  const records: OngiNotificationCreator[] = [];
  for (const userId of recipientUserIds) {
    if (seen.has(userId)) continue;
    seen.add(userId);
    records.push({ userId, type, title: message.title, body: message.body, data, actorUserId });
  }
  return records;
}

export function notificationRetentionCutoff(now: Date): Date {
  return new Date(now.getTime() - NOTIFICATION_RETENTION_DAYS * 24 * 60 * 60 * 1000);
}
