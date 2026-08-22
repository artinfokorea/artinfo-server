import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum ONGI_NOTIFICATION_TYPE {
  PHOTO_UPLOADED = 'PHOTO_UPLOADED',
  PHOTO_LIKED = 'PHOTO_LIKED',
  COMMENT_ADDED = 'COMMENT_ADDED',
}

export interface OngiNotificationCreator {
  recipientUserId: number;
  groupId: number;
  type: ONGI_NOTIFICATION_TYPE;
  message: string;
  actorMemberId: number | null;
  photoId: number | null;
  photoUrl: string | null;
}

/** 인앱 알림 — 문구는 생성 시점에 완성해 저장한다 (행위자 이름 변경은 반영하지 않음) */
@Entity('ongi_notifications')
export class OngiNotification extends BaseEntity {
  @PrimaryGeneratedColumn('increment', { name: 'id' })
  id: number;

  @Column({ type: 'int', name: 'recipient_user_id' })
  recipientUserId: number;

  @Column({ type: 'int', name: 'group_id' })
  groupId: number;

  @Column({ type: 'varchar', name: 'type' })
  type: ONGI_NOTIFICATION_TYPE;

  @Column({ type: 'varchar', name: 'message' })
  message: string;

  @Column({ type: 'int', name: 'actor_member_id', nullable: true })
  actorMemberId: number | null;

  @Column({ type: 'int', name: 'photo_id', nullable: true })
  photoId: number | null;

  @Column({ type: 'varchar', name: 'photo_url', nullable: true })
  photoUrl: string | null;

  @Column({ type: 'timestamp', name: 'read_at', nullable: true })
  readAt: Date | null;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;
}
