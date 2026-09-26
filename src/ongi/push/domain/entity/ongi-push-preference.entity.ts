import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';

/** 사용자별 푸시 종류 수신 설정 — 행이 없으면 전부 켜짐으로 본다. 모든 기기에 공통 */
@Entity('ongi_push_preferences')
export class OngiPushPreference extends BaseEntity {
  @PrimaryColumn({ type: 'int', name: 'user_id' })
  userId: number;

  @Column({ type: 'boolean', name: 'photo_enabled', default: true })
  photoEnabled: boolean;

  @Column({ type: 'boolean', name: 'comment_enabled', default: true })
  commentEnabled: boolean;

  @Column({ type: 'boolean', name: 'like_enabled', default: true })
  likeEnabled: boolean;

  @Column({ type: 'boolean', name: 'event_enabled', default: true })
  eventEnabled: boolean;

  @Column({ type: 'boolean', name: 'family_enabled', default: true })
  familyEnabled: boolean;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;
}
