import { BaseEntity, Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { LikeTypeEnum } from '@/like/LikeTypeEnum';
import { PostEntity } from '@/post/PostEntity';

@Entity('likes')
export class LikeEntity extends BaseEntity {
  @PrimaryGeneratedColumn('increment', { name: 'id' })
  id: number;

  @Column({ name: 'type' })
  type: LikeTypeEnum;

  @Column({ name: 'user_id' })
  userId: number;

  @ManyToOne(() => PostEntity, post => post.likes)
  @JoinColumn({ name: 'target_id' })
  post: PostEntity;

  @Column({ name: 'target_id' })
  targetId: number;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @DeleteDateColumn({ type: 'timestamp', name: 'deleted_at', nullable: true })
  deletedAt: Date | null;
}
