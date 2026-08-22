import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

/** 사용자 차단 — 차단한 사용자의 사진·댓글이 나에게 보이지 않는다 (그룹과 무관하게 사용자 단위) */
@Entity('ongi_blocks')
export class OngiBlock extends BaseEntity {
  @PrimaryGeneratedColumn('increment', { name: 'id' })
  id: number;

  @Column({ type: 'int', name: 'user_id' })
  userId: number;

  @Column({ type: 'int', name: 'blocked_user_id' })
  blockedUserId: number;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;
}
