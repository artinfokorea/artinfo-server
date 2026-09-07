/** 좋아요 푸시 쿨다운(ms) — 같은 사람이 같은 사진에 좋아요를 반복해도 이 시간 안에는 푸시 1번 */
const COOLDOWN_MS = 6 * 60 * 60 * 1000;
/** 메모리 상한 — 넘으면 만료 항목을 정리한다 (서버 인스턴스별 상태라 2대 환경에선 최악의 경우 2번 발송) */
const MAX_ENTRIES = 10_000;

export class OngiLikePushThrottle {
  /** `${photoId}:${likerUserId}` → 마지막 발송 시각(ms) */
  private readonly sentAt = new Map<string, number>();

  constructor(private readonly cooldownMs: number = COOLDOWN_MS) {}

  /** 지금 푸시를 보내도 되면 true 를 반환하고 발송 시각을 기록한다. 막힌 시도는 기록하지 않아 쿨다운이 연장되지 않는다 */
  shouldNotify(photoId: number, likerUserId: number, now: number = Date.now()): boolean {
    const key = `${photoId}:${likerUserId}`;
    const last = this.sentAt.get(key);
    if (last != null && now - last < this.cooldownMs) return false;

    if (this.sentAt.size >= MAX_ENTRIES) {
      for (const [entryKey, at] of this.sentAt) {
        if (now - at >= this.cooldownMs) this.sentAt.delete(entryKey);
      }
      if (this.sentAt.size >= MAX_ENTRIES) this.sentAt.clear();
    }
    this.sentAt.set(key, now);

    return true;
  }
}
