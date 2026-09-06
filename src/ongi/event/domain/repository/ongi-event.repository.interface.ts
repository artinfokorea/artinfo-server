import { OngiEvent, OngiEventDraft } from '@/ongi/event/domain/entity/ongi-event.entity';

export const ONGI_EVENT_REPOSITORY = Symbol('ONGI_EVENT_REPOSITORY');

export interface IOngiEventRepository {
  create(draft: OngiEventDraft): Promise<OngiEvent>;
  findById(id: number): Promise<OngiEvent | null>;
  scanByGroupId(groupId: number): Promise<OngiEvent[]>;
  update(id: number, patch: Partial<OngiEventDraft> & { remindDaySentAt?: Date | null; remindHourSentAt?: Date | null }): Promise<void>;
  softDeleteById(id: number): Promise<void>;
  /** 발송 시각이 지난 하루 전 리마인드를 원자적으로 점유 — 서버 2대에서 중복 발송되지 않게 UPDATE ... RETURNING */
  claimDueDayReminders(now: Date): Promise<OngiEvent[]>;
  /** 발송 시각이 지난 1시간 전 리마인드를 원자적으로 점유 */
  claimDueHourReminders(now: Date): Promise<OngiEvent[]>;
  /** 발생일이 지난 반복 일정 — 다음 발생일로 굴릴 대상 */
  scanRepeatingBefore(dateKst: string): Promise<OngiEvent[]>;
}
