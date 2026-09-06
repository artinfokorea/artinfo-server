import { BaseEntity, Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

/** 앱과 동일한 소문자 값 */
export const ONGI_EVENT_CALENDAR = { SOLAR: 'solar', LUNAR: 'lunar' } as const;
export type OngiEventCalendar = (typeof ONGI_EVENT_CALENDAR)[keyof typeof ONGI_EVENT_CALENDAR];

export const ONGI_EVENT_REPEAT = { NONE: 'none', WEEKLY: 'weekly', MONTHLY: 'monthly', YEARLY: 'yearly' } as const;
export type OngiEventRepeat = (typeof ONGI_EVENT_REPEAT)[keyof typeof ONGI_EVENT_REPEAT];

export interface OngiEventDraft {
  groupId: number;
  creatorUserId: number;
  title: string;
  /** 사용자가 입력한 날짜 (calendarType 기준) — YYYY-MM-DD */
  eventDate: string;
  /** HH:MM (24h) — null 이면 하루 종일 */
  eventTime: string | null;
  calendarType: OngiEventCalendar;
  repeatType: OngiEventRepeat;
  memo: string | null;
  /** 등록·리마인드 푸시를 받을 사용자 id 목록 */
  notifyUserIds: number[];
  /** 다음 발생일(양력) — 조회·리마인드 계산 기준. YYYY-MM-DD */
  nextOccurrence: string;
  remindDayAt: Date | null;
  remindHourAt: Date | null;
}

/**
 * 가족 일정 — 양력/음력, 반복, 대상 지정 푸시(등록·하루 전·1시간 전)를 지원한다.
 * 반복 일정은 next_occurrence(양력)를 굴리며, 리마인드 시각은 발생일마다 다시 계산한다.
 */
@Entity('ongi_events')
export class OngiEvent extends BaseEntity {
  @PrimaryGeneratedColumn('increment', { name: 'id' })
  id: number;

  @Column({ type: 'int', name: 'group_id' })
  groupId: number;

  @Column({ type: 'int', name: 'creator_user_id' })
  creatorUserId: number;

  @Column({ type: 'varchar', name: 'title' })
  title: string;

  @Column({ type: 'varchar', name: 'event_date', length: 10 })
  eventDate: string;

  @Column({ type: 'varchar', name: 'event_time', length: 5, nullable: true })
  eventTime: string | null;

  @Column({ type: 'varchar', name: 'calendar_type', length: 8, default: ONGI_EVENT_CALENDAR.SOLAR })
  calendarType: string;

  @Column({ type: 'varchar', name: 'repeat_type', length: 8, default: ONGI_EVENT_REPEAT.NONE })
  repeatType: string;

  @Column({ type: 'text', name: 'memo', nullable: true })
  memo: string | null;

  @Column({ type: 'jsonb', name: 'notify_user_ids', default: () => "'[]'" })
  notifyUserIds: number[];

  @Column({ type: 'varchar', name: 'next_occurrence', length: 10 })
  nextOccurrence: string;

  @Column({ type: 'timestamp', name: 'remind_day_at', nullable: true })
  remindDayAt: Date | null;

  @Column({ type: 'timestamp', name: 'remind_hour_at', nullable: true })
  remindHourAt: Date | null;

  @Column({ type: 'timestamp', name: 'remind_day_sent_at', nullable: true })
  remindDaySentAt: Date | null;

  @Column({ type: 'timestamp', name: 'remind_hour_sent_at', nullable: true })
  remindHourSentAt: Date | null;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp', name: 'deleted_at', nullable: true })
  deletedAt: Date | null;
}
