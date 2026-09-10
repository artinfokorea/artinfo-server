import { BaseEntity, Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export interface SalpyeoInquiryCreator {
  title: string;
  content: string;
  /** 답변을 받을 이메일 */
  email: string;
  /** 첨부 사진 S3 URL */
  images: string[];
}

/** 사용자가 보낸 문의 — 로그인 없이 접수한다 */
@Entity('salpyeo_inquiries')
export class SalpyeoInquiry extends BaseEntity {
  @PrimaryGeneratedColumn('increment', { name: 'id' })
  id: number;

  @Column({ type: 'varchar', name: 'title', length: 100 })
  title: string;

  @Column({ type: 'text', name: 'content' })
  content: string;

  @Column({ type: 'varchar', name: 'email', length: 200 })
  email: string;

  @Column({ type: 'jsonb', name: 'images', default: () => `'[]'` })
  images: string[];

  /** 관리자가 처리 완료로 표시했는지 */
  @Column({ type: 'boolean', name: 'is_resolved', default: false })
  isResolved: boolean;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp', name: 'deleted_at', nullable: true })
  deletedAt: Date | null;
}
