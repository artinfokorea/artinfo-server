import { Inject, Injectable } from '@nestjs/common';
import { IOngiEventRepository, ONGI_EVENT_REPOSITORY } from '@/ongi/event/domain/repository/ongi-event.repository.interface';
import { IOngiMemberRepository, ONGI_MEMBER_REPOSITORY } from '@/ongi/group/domain/repository/ongi-member.repository.interface';
import { OngiNotGroupMember } from '@/ongi/group/domain/exception/ongi-group.exception';
import { ONGI_MEMBER_ROLE } from '@/ongi/group/domain/entity/ongi-member.entity';
import { OngiEvent, OngiEventCalendar, OngiEventDraft, OngiEventRepeat } from '@/ongi/event/domain/entity/ongi-event.entity';
import { OngiEventNotFound, OngiInvalidEventDate, OngiNotEventEditor } from '@/ongi/event/domain/exception/ongi-event.exception';
import { baseSolarDate, nextOccurrenceOnOrAfter, occurrencesInRange, remindTimesFor, todayKst } from '@/ongi/event/domain/service/ongi-event-occurrence';
import { OngiPushService } from '@/ongi/push/application/service/ongi-push.service';

export interface OngiEventInput {
  title: string;
  date: string;
  time: string | null;
  calendarType: OngiEventCalendar;
  repeatType: OngiEventRepeat;
  memo: string | null;
  notifyUserIds: number[];
}

/** 발생일 하나 = 목록의 한 줄 — 반복 일정은 범위 안에서 여러 번 나타난다 */
export interface OngiEventOccurrenceView {
  event: OngiEvent;
  /** 이 발생일(양력) YYYY-MM-DD */
  date: string;
  creatorName: string | null;
}

/** 대상 사용자 목록을 그룹 구성원으로 한정 — 탈퇴자·타 그룹 id 가 섞여 들어오지 않게 */
async function sanitizeNotifyUserIds(memberRepository: IOngiMemberRepository, groupId: number, userIds: number[]): Promise<number[]> {
  const members = await memberRepository.scanByGroupId(groupId);
  const memberUserIds = new Set(members.map(m => m.userId));
  return [...new Set(userIds)].filter(id => memberUserIds.has(id));
}

function draftOf(groupId: number, creatorUserId: number, input: OngiEventInput, notifyUserIds: number[]): OngiEventDraft {
  const schedule = { eventDate: input.date, eventTime: input.time, calendarType: input.calendarType, repeatType: input.repeatType };
  if (!baseSolarDate(schedule)) throw new OngiInvalidEventDate();

  const nextOccurrence = nextOccurrenceOnOrAfter(schedule, todayKst());
  if (!nextOccurrence) throw new OngiInvalidEventDate();

  const { dayAt, hourAt } = remindTimesFor(nextOccurrence, input.time, new Date());

  return {
    groupId,
    creatorUserId,
    title: input.title,
    eventDate: input.date,
    eventTime: input.time,
    calendarType: input.calendarType,
    repeatType: input.repeatType,
    memo: input.memo,
    notifyUserIds,
    nextOccurrence,
    remindDayAt: dayAt,
    remindHourAt: hourAt,
  };
}

@Injectable()
export class OngiScanEventsUseCase {
  constructor(
    @Inject(ONGI_EVENT_REPOSITORY)
    private readonly eventRepository: IOngiEventRepository,

    @Inject(ONGI_MEMBER_REPOSITORY)
    private readonly memberRepository: IOngiMemberRepository,
  ) {}

  /** [from, to] 범위의 발생일들 — 날짜·시간순 */
  async execute(userId: number, groupId: number, from: string, to: string): Promise<OngiEventOccurrenceView[]> {
    const me = await this.memberRepository.findByGroupIdAndUserId(groupId, userId);
    if (!me) throw new OngiNotGroupMember();

    const [events, members] = await Promise.all([this.eventRepository.scanByGroupId(groupId), this.memberRepository.scanByGroupId(groupId)]);
    const nameByUserId = new Map(members.map(m => [m.userId, m.name]));

    const views: OngiEventOccurrenceView[] = [];
    for (const event of events) {
      const schedule = { eventDate: event.eventDate, eventTime: event.eventTime, calendarType: event.calendarType, repeatType: event.repeatType };
      for (const date of occurrencesInRange(schedule, from, to)) {
        views.push({ event, date, creatorName: nameByUserId.get(event.creatorUserId) ?? null });
      }
    }

    return views.sort((a, b) => a.date.localeCompare(b.date) || (a.event.eventTime ?? '').localeCompare(b.event.eventTime ?? '') || a.event.id - b.event.id);
  }
}

@Injectable()
export class OngiCreateEventUseCase {
  constructor(
    @Inject(ONGI_EVENT_REPOSITORY)
    private readonly eventRepository: IOngiEventRepository,

    @Inject(ONGI_MEMBER_REPOSITORY)
    private readonly memberRepository: IOngiMemberRepository,

    private readonly pushService: OngiPushService,
  ) {}

  async execute(userId: number, groupId: number, input: OngiEventInput): Promise<OngiEventOccurrenceView> {
    const me = await this.memberRepository.findByGroupIdAndUserId(groupId, userId);
    if (!me) throw new OngiNotGroupMember();

    const notifyUserIds = await sanitizeNotifyUserIds(this.memberRepository, groupId, input.notifyUserIds);
    const event = await this.eventRepository.create(draftOf(groupId, userId, input, notifyUserIds));

    // 등록 즉시 — 알림 대상 중 본인 제외
    this.pushService.notifyUsers(
      notifyUserIds.filter(id => id !== userId),
      {
        title: '온기',
        body: `${me.name}님이 '${event.title}' 일정을 등록했어요 📅`,
        data: { type: 'event_created', groupId: String(groupId), eventId: String(event.id) },
      },
    );

    return { event, date: event.nextOccurrence, creatorName: me.name };
  }
}

@Injectable()
export class OngiUpdateEventUseCase {
  constructor(
    @Inject(ONGI_EVENT_REPOSITORY)
    private readonly eventRepository: IOngiEventRepository,

    @Inject(ONGI_MEMBER_REPOSITORY)
    private readonly memberRepository: IOngiMemberRepository,

    private readonly pushService: OngiPushService,
  ) {}

  /** 만든 사람 또는 관리자만 — 날짜가 바뀌면 리마인드도 처음부터 다시 계산 */
  async execute(userId: number, eventId: number, input: OngiEventInput): Promise<OngiEventOccurrenceView> {
    const event = await this.eventRepository.findById(eventId);
    if (!event) throw new OngiEventNotFound();

    const me = await this.memberRepository.findByGroupIdAndUserId(event.groupId, userId);
    if (!me) throw new OngiNotGroupMember();
    if (event.creatorUserId !== userId && me.role !== ONGI_MEMBER_ROLE.ADMIN) throw new OngiNotEventEditor();

    const notifyUserIds = await sanitizeNotifyUserIds(this.memberRepository, event.groupId, input.notifyUserIds);
    const draft = draftOf(event.groupId, event.creatorUserId, input, notifyUserIds);
    await this.eventRepository.update(eventId, { ...draft, remindDaySentAt: null, remindHourSentAt: null });

    this.pushService.notifyUsers(
      notifyUserIds.filter(id => id !== userId),
      { title: '온기', body: `'${draft.title}' 일정이 변경됐어요`, data: { type: 'event_updated', groupId: String(event.groupId), eventId: String(eventId) } },
    );

    const updated = await this.eventRepository.findById(eventId);
    if (!updated) throw new OngiEventNotFound();
    const creator = await this.memberRepository.findByGroupIdAndUserId(updated.groupId, updated.creatorUserId);

    return { event: updated, date: updated.nextOccurrence, creatorName: creator?.name ?? null };
  }
}

@Injectable()
export class OngiDeleteEventUseCase {
  constructor(
    @Inject(ONGI_EVENT_REPOSITORY)
    private readonly eventRepository: IOngiEventRepository,

    @Inject(ONGI_MEMBER_REPOSITORY)
    private readonly memberRepository: IOngiMemberRepository,
  ) {}

  /** 만든 사람 또는 관리자만 — 남은 리마인드는 소프트 삭제로 자연히 발송되지 않는다 */
  async execute(userId: number, eventId: number): Promise<void> {
    const event = await this.eventRepository.findById(eventId);
    if (!event) throw new OngiEventNotFound();

    const me = await this.memberRepository.findByGroupIdAndUserId(event.groupId, userId);
    if (!me) throw new OngiNotGroupMember();
    if (event.creatorUserId !== userId && me.role !== ONGI_MEMBER_ROLE.ADMIN) throw new OngiNotEventEditor();

    await this.eventRepository.softDeleteById(eventId);
  }
}
