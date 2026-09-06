import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { IOngiEventRepository, ONGI_EVENT_REPOSITORY } from '@/ongi/event/domain/repository/ongi-event.repository.interface';
import { formatTimeKo, nextOccurrenceOnOrAfter, remindTimesFor, todayKst } from '@/ongi/event/domain/service/ongi-event-occurrence';
import { OngiPushService } from '@/ongi/push/application/service/ongi-push.service';

/**
 * 일정 리마인더 — 10분마다 ① 지난 반복 일정을 다음 발생일로 굴리고 ② 발송 시각이 된 리마인드를 보낸다.
 * 발송 점유는 UPDATE ... RETURNING 이라 서버 2대에서도 중복 발송되지 않는다.
 */
@Injectable()
export class OngiEventReminderService {
  private readonly logger = new Logger(OngiEventReminderService.name);

  constructor(
    @Inject(ONGI_EVENT_REPOSITORY)
    private readonly eventRepository: IOngiEventRepository,

    private readonly pushService: OngiPushService,
  ) {}

  @Cron(CronExpression.EVERY_10_MINUTES)
  async tick(): Promise<void> {
    try {
      await this.rollOccurrences();
      await this.sendDueReminders();
    } catch (error) {
      this.logger.warn(`event reminder tick failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /** 발생일이 지난 반복 일정 → 다음 발생일 + 새 리마인드 시각으로 초기화 */
  private async rollOccurrences(): Promise<void> {
    const today = todayKst();
    for (const event of await this.eventRepository.scanRepeatingBefore(today)) {
      const schedule = { eventDate: event.eventDate, eventTime: event.eventTime, calendarType: event.calendarType, repeatType: event.repeatType };
      const next = nextOccurrenceOnOrAfter(schedule, today);
      if (!next || next === event.nextOccurrence) continue;

      const { dayAt, hourAt } = remindTimesFor(next, event.eventTime, new Date());
      await this.eventRepository.update(event.id, {
        nextOccurrence: next,
        remindDayAt: dayAt,
        remindHourAt: hourAt,
        remindDaySentAt: null,
        remindHourSentAt: null,
      });
    }
  }

  private async sendDueReminders(): Promise<void> {
    const now = new Date();

    for (const event of await this.eventRepository.claimDueDayReminders(now)) {
      const timeSuffix = event.eventTime ? ` (${formatTimeKo(event.eventTime)})` : '';
      this.pushService.notifyUsers(event.notifyUserIds, {
        title: '온기',
        body: `내일 '${event.title}' 일정이 있어요${timeSuffix} ⏰`,
        data: { type: 'event_reminder', groupId: String(event.groupId), eventId: String(event.id) },
      });
    }

    for (const event of await this.eventRepository.claimDueHourReminders(now)) {
      this.pushService.notifyUsers(event.notifyUserIds, {
        title: '온기',
        body: `1시간 뒤 '${event.title}' 일정이 있어요 ⏰`,
        data: { type: 'event_reminder', groupId: String(event.groupId), eventId: String(event.id) },
      });
    }
  }
}
