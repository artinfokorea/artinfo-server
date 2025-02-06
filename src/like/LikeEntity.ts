import { Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { LikeTypeEnum } from '@/like/LikeTypeEnum';

@Entity('likes')
export class LikeEntity {
  @PrimaryGeneratedColumn('increment', { name: 'id' })
  id: number;

  @Column({ name: 'type' })
  type: LikeTypeEnum;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'target_id' })
  targetId: number;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @DeleteDateColumn({ type: 'timestamp', name: 'deleted_at', nullable: true })
  deletedAt: Date | null;
}
