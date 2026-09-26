import { BaseEntity, Column, Entity, PrimaryColumn } from 'typeorm';

/** 알림 목록을 마지막으로 연 시각 — 이보다 뒤에 생긴 알림이 "새로운 알림"이고 그 개수가 배지 숫자 (인스타그램 방식: 목록을 열면 전부 본 것으로) */
@Entity('ongi_notification_seen')
export class OngiNotificationSeen extends BaseEntity {
  @PrimaryColumn({ type: 'int', name: 'user_id' })
  userId: number;

  @Column({ type: 'timestamp', name: 'seen_at' })
  seenAt: Date;
}
