import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AzeyoSchedule, AZEYO_SCHEDULE_REPEAT_TYPE, AZEYO_SCHEDULE_CALENDAR_TYPE } from '@/azeyo/schedule/domain/entity/azeyo-schedule.entity';
import { AZEYO_NOTIFICATION_SENDER, IAzeyoNotificationSender } from '@/azeyo/notification/domain/service/azeyo-notification-sender.interface';
import { AZEYO_NOTIFICATION_TYPE } from '@/azeyo/notification/domain/entity/azeyo-notification.entity';
import { AZEYO_NOTIFICATION_SETTING_REPOSITORY, IAzeyoNotificationSettingRepository } from '@/azeyo/notification/domain/repository/azeyo-notification-setting.repository.interface';
import { AZEYO_USER_REPOSITORY, IAzeyoUserRepository } from '@/azeyo/user/domain/repository/azeyo-user.repository.interface';
import { AzeyoAlimtalkHistory } from '@/azeyo/notification/domain/entity/azeyo-alimtalk-history.entity';
import { ALIMTALK_TEMPLATE } from '@/azeyo/notification/domain/constant/alimtalk-template.constant';
import { SystemService } from '@/system/service/system.service';

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
    @Inject(AZEYO_NOTIFICATION_SETTING_REPOSITORY)
    private readonly settingRepository: IAzeyoNotificationSettingRepository,
    @Inject(AZEYO_USER_REPOSITORY)
    private readonly userRepository: IAzeyoUserRepository,
    private readonly systemService: SystemService,
    @InjectRepository(AzeyoAlimtalkHistory)
    private readonly alimtalkHistoryRepository: Repository<AzeyoAlimtalkHistory>,
  ) {}

  async execute(options: { days: number[] }): Promise<{ counts: Record<number, number> }> {
    const schedules = await this.scheduleRepository.find({ where: { deletedAt: undefined } });

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisYear = now.getFullYear();

    const counts: Record<number, number> = {};
    for (const d of options.days) counts[d] = 0;

    const messageByDiff: Record<number, string> = {
      3: '3일 남았어요',
      1: '내일이에요',
      0: '오늘이에요',
    };

    const templateByDiff: Record<number, string | undefined> = {
      3: ALIMTALK_TEMPLATE.SCHEDULE_D3,
      1: ALIMTALK_TEMPLATE.SCHEDULE_D1,
      0: ALIMTALK_TEMPLATE.SCHEDULE_D0,
    };

    for (const schedule of schedules) {
      const targetDate = this.resolveNextDate(schedule, thisYear);
      if (!targetDate) continue;

      const target = new Date(targetDate + 'T00:00:00');
      const diffDays = Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      if (!options.days.includes(diffDays)) continue;

      await this.notificationSender.send({
        userId: schedule.userId,
        type: AZEYO_NOTIFICATION_TYPE.SCHEDULE,
        title: '일정 알림',
        body: `'${schedule.title}' 일정이 ${messageByDiff[diffDays] ?? `${diffDays}일 남았어요`}`,
        referenceId: String(schedule.id),
      });
      counts[diffDays]++;

      const templateId = templateByDiff[diffDays];
      if (templateId) {
        await this.sendAlimtalk(schedule, templateId);
      }
    }

    return { counts };
  }

  private async sendAlimtalk(schedule: AzeyoSchedule, templateId: string): Promise<void> {
    try {
      const setting = await this.settingRepository.findByUserId(schedule.userId);
      if (setting && !setting.scheduleEnabled) return;

      const user = await this.userRepository.findOneOrThrowById(schedule.userId);
      if (!user.phone) return;

      const variables = { '#{scheduleTitle}': schedule.title };
      try {
        await this.systemService.sendAlimtalk(user.phone, templateId, variables);
        await this.alimtalkHistoryRepository.save({ userId: user.id, phone: user.phone, templateId, variables, isSuccess: true, errorMessage: null });
      } catch (sendError) {
        await this.alimtalkHistoryRepository.save({ userId: user.id, phone: user.phone, templateId, variables, isSuccess: false, errorMessage: String(sendError) });
        throw sendError;
      }
    } catch (e) {
      this.logger.error(`일정 알림톡 발송 실패 - scheduleId: ${schedule.id}, templateId: ${templateId}`, e);
    }
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
