import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AzeyoSchedule, AZEYO_SCHEDULE_REPEAT_TYPE, AZEYO_SCHEDULE_CALENDAR_TYPE } from '@/azeyo/schedule/domain/entity/azeyo-schedule.entity';
import { AZEYO_NOTIFICATION_SENDER, IAzeyoNotificationSender } from '@/azeyo/notification/domain/service/azeyo-notification-sender.interface';
import { AZEYO_NOTIFICATION_TYPE } from '@/azeyo/notification/domain/entity/azeyo-notification.entity';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const KoreanLunarCalendar = require('korean-lunar-calendar');

@Injectable()
export class AzeyoSendScheduleNotificationsUseCase {
  private readonly logger = new Logger(AzeyoSendScheduleNotificationsUseCase.name);

  constructor(
    @InjectRepository(AzeyoSchedule)
    private readonly scheduleRepository: Repository<AzeyoSchedule>,
    @Inject(AZEYO_NOTIFICATION_SENDER)
    private readonly notificationSender: IAzeyoNotificationSender,
  ) {}

  async execute(): Promise<{ d3Count: number; d1Count: number }> {
    const schedules = await this.scheduleRepository.find({ where: { deletedAt: undefined } });

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisYear = now.getFullYear();

    let d3Count = 0;
    let d1Count = 0;

    for (const schedule of schedules) {
      const targetDate = this.resolveNextDate(schedule, thisYear);
      if (!targetDate) continue;

      const target = new Date(targetDate + 'T00:00:00');
      const diffDays = Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays === 3) {
        await this.notificationSender.send({
          userId: schedule.userId,
          type: AZEYO_NOTIFICATION_TYPE.SCHEDULE,
          title: '��정 알림',
          body: `'${schedule.title}' 일정이 3일 남았어요`,
          referenceId: String(schedule.id),
        });
        d3Count++;
      } else if (diffDays === 1) {
        await this.notificationSender.send({
          userId: schedule.userId,
          type: AZEYO_NOTIFICATION_TYPE.SCHEDULE,
          title: '일정 알림',
          body: `'${schedule.title}' 일정이 내일이에요`,
          referenceId: String(schedule.id),
        });
        d1Count++;
      }
    }

    return { d3Count, d1Count };
  }

  private resolveNextDate(schedule: AzeyoSchedule, thisYear: number): string | null {
    if (schedule.repeatType !== AZEYO_SCHEDULE_REPEAT_TYPE.YEARLY || !schedule.startDate) {
      return schedule.date;
    }

    if (schedule.calendarType === AZEYO_SCHEDULE_CALENDAR_TYPE.LUNAR) {
      const orig = new Date(schedule.startDate);
      const lunarMonth = orig.getMonth() + 1;
      const lunarDay = orig.getDate();

      const cal = new KoreanLunarCalendar();
      const valid = cal.setLunarDate(thisYear, lunarMonth, lunarDay, false);
      if (valid) {
        const solar = cal.getSolarCalendar();
        return `${solar.year}-${String(solar.month).padStart(2, '0')}-${String(solar.day).padStart(2, '0')}`;
      }
      return null;
    }

    // 양력 매년 반복
    const orig = new Date(schedule.date);
    const month = orig.getMonth();
    const day = orig.getDate();
    const thisYearDate = new Date(thisYear, month, day);
    const now = new Date();

    if (thisYearDate.getTime() < now.getTime() - 86400000) {
      const nextYear = new Date(thisYear + 1, month, day);
      return nextYear.toISOString().split('T')[0];
    }
    return thisYearDate.toISOString().split('T')[0];
  }
}
