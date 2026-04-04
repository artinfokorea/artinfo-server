import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AzeyoCommunityPost } from '@/azeyo/community/domain/entity/azeyo-community-post.entity';

@Entity('azeyo_community_likes')
export class AzeyoCommunityLike extends BaseEntity {
  @PrimaryGeneratedColumn('increment', { name: 'id' })
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @ManyToOne(() => AzeyoCommunityPost, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'target_id', referencedColumnName: 'id' })
  post: AzeyoCommunityPost;

  @Column({ name: 'target_id' })
  targetId: number;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @DeleteDateColumn({ type: 'timestamp', name: 'deleted_at', nullable: true })
  deletedAt: Date | null;
}
