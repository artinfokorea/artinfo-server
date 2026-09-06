import { ApiProperty } from '@nestjs/swagger';
import { OngiEventOccurrenceView } from '@/ongi/event/application/usecase/ongi-event.usecase';
import { lunarLabelOf } from '@/ongi/event/domain/service/ongi-event-occurrence';

export class OngiEventResponse {
  @ApiProperty({ type: String, description: '일정 id' })
  id: string;

  @ApiProperty({ type: String, description: '그룹 id' })
  groupId: string;

  @ApiProperty({ type: String, description: '제목' })
  title: string;

  @ApiProperty({ type: String, description: '이 발생일(양력) YYYY-MM-DD — 반복 일정은 발생일마다 한 건씩 내려간다' })
  date: string;

  @ApiProperty({ type: String, nullable: true, description: 'HH:MM — null 이면 하루 종일' })
  time: string | null;

  @ApiProperty({ type: String, description: 'solar | lunar' })
  calendarType: string;

  @ApiProperty({ type: String, description: 'none | weekly | monthly | yearly' })
  repeatType: string;

  @ApiProperty({ type: String, nullable: true, description: '메모' })
  memo: string | null;

  @ApiProperty({ type: [String], description: '알림 받을 사용자 id 목록' })
  notifyUserIds: string[];

  @ApiProperty({ type: String, description: '만든 사용자 id' })
  creatorUserId: string;

  @ApiProperty({ type: String, nullable: true, description: '만든 사람 호칭' })
  creatorName: string | null;

  @ApiProperty({ type: String, nullable: true, description: '음력 일정이면 이 발생일의 음력 표기 ("음력 8월 1일")' })
  lunarLabel: string | null;

  @ApiProperty({ type: String, description: '입력 원본 날짜 (calendarType 기준) — 수정 폼 초기값' })
  sourceDate: string;

  @ApiProperty({ type: String, description: '등록 시각 ISO' })
  createdAt: string;

  constructor(view: OngiEventOccurrenceView) {
    this.id = String(view.event.id);
    this.groupId = String(view.event.groupId);
    this.title = view.event.title;
    this.date = view.date;
    this.time = view.event.eventTime;
    this.calendarType = view.event.calendarType;
    this.repeatType = view.event.repeatType;
    this.memo = view.event.memo;
    this.notifyUserIds = (view.event.notifyUserIds ?? []).map(String);
    this.creatorUserId = String(view.event.creatorUserId);
    this.creatorName = view.creatorName;
    this.lunarLabel = view.event.calendarType === 'lunar' ? lunarLabelOf(view.date) : null;
    this.sourceDate = view.event.eventDate;
    this.createdAt = view.event.createdAt?.toISOString?.() ?? new Date().toISOString();
  }
}

export class OngiEventListResponse {
  @ApiProperty({ type: [OngiEventResponse], description: '범위 안의 발생일들 (날짜·시간순)' })
  events: OngiEventResponse[];

  constructor(views: OngiEventOccurrenceView[]) {
    this.events = views.map(view => new OngiEventResponse(view));
  }
}
