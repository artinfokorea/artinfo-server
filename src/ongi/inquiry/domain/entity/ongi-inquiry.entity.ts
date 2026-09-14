import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export interface OngiInquiryCreator {
  userId: number;
  content: string;
}

/** 앱 문의 — 운영자가 관리자 페이지에서 답변하면 문의한 사용자가 앱에서 본다 */
@Entity('ongi_inquiries')
export class OngiInquiry extends BaseEntity {
  @PrimaryGeneratedColumn('increment', { name: 'id' })
  id: number;

  @Column({ type: 'int', name: 'user_id' })
  userId: number;

  @Column({ type: 'varchar', name: 'content' })
  content: string;

  @Column({ type: 'varchar', name: 'answer', nullable: true })
  answer: string | null;

  @Column({ type: 'int', name: 'answered_by_user_id', nullable: true })
  answeredByUserId: number | null;

  @Column({ type: 'timestamp', name: 'answered_at', nullable: true })
  answeredAt: Date | null;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;
}
