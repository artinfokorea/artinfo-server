import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export enum ONGI_REPORT_TARGET_TYPE {
  PHOTO = 'photo',
  COMMENT = 'comment',
  MEMBER = 'member',
}

export enum ONGI_REPORT_STATUS {
  OPEN = 'open',
  RESOLVED = 'resolved',
}

export interface OngiReportCreator {
  reporterUserId: number;
  targetType: ONGI_REPORT_TARGET_TYPE;
  targetId: number;
  reason: string;
}

/** 신고 — 운영자가 24시간 내 검토해 조치한다 (App Store 1.2) */
@Entity('ongi_reports')
export class OngiReport extends BaseEntity {
  @PrimaryGeneratedColumn('increment', { name: 'id' })
  id: number;

  @Column({ type: 'int', name: 'reporter_user_id' })
  reporterUserId: number;

  @Column({ type: 'varchar', name: 'target_type', length: 16 })
  targetType: string;

  @Column({ type: 'int', name: 'target_id' })
  targetId: number;

  @Column({ type: 'varchar', name: 'reason' })
  reason: string;

  @Column({ type: 'varchar', name: 'status', length: 16, default: ONGI_REPORT_STATUS.OPEN })
  status: string;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;
}
