import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AzeyoUser } from '@/azeyo/user/domain/entity/azeyo-user.entity';
import { AzeyoCommunityPost } from '@/azeyo/community/domain/entity/azeyo-community-post.entity';

@Entity('azeyo_community_votes')
export class AzeyoCommunityVote extends BaseEntity {
  @PrimaryGeneratedColumn('increment', { name: 'id' })
  id: number;

  @ManyToOne(() => AzeyoUser)
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: AzeyoUser;

  @Column({ name: 'user_id' })
  userId: number;

  @ManyToOne(() => AzeyoCommunityPost, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'post_id', referencedColumnName: 'id' })
  post: AzeyoCommunityPost;

  @Column({ name: 'post_id' })
  postId: number;

  @Column({ type: 'varchar', name: 'option' })
  option: 'A' | 'B';

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;
}
