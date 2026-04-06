import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AzeyoCommunityPost } from '@/azeyo/community/domain/entity/azeyo-community-post.entity';

export enum AZEYO_COMMUNITY_REPORT_REASON {
  SPAM = 'SPAM',
  INAPPROPRIATE = 'INAPPROPRIATE',
  HARASSMENT = 'HARASSMENT',
  FALSE_INFO = 'FALSE_INFO',
  OTHER = 'OTHER',
}

@Entity('azeyo_community_reports')
export class AzeyoCommunityReport extends BaseEntity {
  @PrimaryGeneratedColumn('increment', { name: 'id' })
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @ManyToOne(() => AzeyoCommunityPost, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'post_id', referencedColumnName: 'id' })
  post: AzeyoCommunityPost;

  @Column({ name: 'post_id' })
  postId: number;

  @Column({ type: 'varchar', name: 'reason' })
  reason: AZEYO_COMMUNITY_REPORT_REASON;

  @Column({ type: 'varchar', name: 'contents', nullable: true })
  contents: string | null;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;
}
