import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Not, Repository } from 'typeorm';
import { IOngiEventRepository } from '@/ongi/event/domain/repository/ongi-event.repository.interface';
import { ONGI_EVENT_REPEAT, OngiEvent, OngiEventDraft } from '@/ongi/event/domain/entity/ongi-event.entity';

@Injectable()
export class OngiEventRepository implements IOngiEventRepository {
  constructor(
    @InjectRepository(OngiEvent)
    private readonly eventRepository: Repository<OngiEvent>,
  ) {}

  async create(draft: OngiEventDraft): Promise<OngiEvent> {
    return this.eventRepository.save({ ...draft });
  }

  async findById(id: number): Promise<OngiEvent | null> {
    return this.eventRepository.findOneBy({ id });
  }

  async scanByGroupId(groupId: number): Promise<OngiEvent[]> {
    return this.eventRepository.find({ where: { groupId }, order: { id: 'ASC' } });
  }

  async update(id: number, patch: Partial<OngiEventDraft> & { remindDaySentAt?: Date | null; remindHourSentAt?: Date | null }): Promise<void> {
    await this.eventRepository.update({ id }, patch);
  }

  async softDeleteById(id: number): Promise<void> {
    await this.eventRepository.softDelete({ id });
  }

  async claimDueDayReminders(now: Date): Promise<OngiEvent[]> {
    return this.claim('remind_day_at', 'remind_day_sent_at', now);
  }

  async claimDueHourReminders(now: Date): Promise<OngiEvent[]> {
    return this.claim('remind_hour_at', 'remind_hour_sent_at', now);
  }

  /** UPDATE ... RETURNING 으로 원자적 점유 — 서버 2대가 같은 리마인드를 두 번 보내지 않게 */
  private async claim(atColumn: string, sentColumn: string, now: Date): Promise<OngiEvent[]> {
    const rows: Record<string, unknown>[] = await this.eventRepository.query(
      `UPDATE ongi_events SET ${sentColumn} = now()
        WHERE deleted_at IS NULL AND ${sentColumn} IS NULL AND ${atColumn} IS NOT NULL AND ${atColumn} <= $1
        RETURNING id, group_id, title, event_time, notify_user_ids, next_occurrence`,
      [now],
    );

    return rows.map(row =>
      this.eventRepository.create({
        id: Number(row.id),
        groupId: Number(row.group_id),
        title: String(row.title),
        eventTime: (row.event_time as string | null) ?? null,
        notifyUserIds: (row.notify_user_ids as number[]) ?? [],
        nextOccurrence: String(row.next_occurrence),
      }),
    );
  }

  async scanRepeatingBefore(dateKst: string): Promise<OngiEvent[]> {
    return this.eventRepository.find({
      where: { repeatType: Not(ONGI_EVENT_REPEAT.NONE), nextOccurrence: LessThan(dateKst) },
    });
  }
}
