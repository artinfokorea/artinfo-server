import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { AzeyoUser } from '@/azeyo/user/domain/entity/azeyo-user.entity';

export enum AZEYO_COMMUNITY_POST_TYPE {
  TEXT = 'TEXT',
  VOTE = 'VOTE',
}

export enum AZEYO_COMMUNITY_CATEGORY {
  GIFT = 'GIFT',
  COUPLE_FIGHT = 'COUPLE_FIGHT',
  HOBBY = 'HOBBY',
  PARENTING = 'PARENTING',
  LIFE_TIP = 'LIFE_TIP',
  FREE = 'FREE',
}

@Entity('azeyo_community_posts')
export class AzeyoCommunityPost extends BaseEntity {
  @PrimaryGeneratedColumn('increment', { name: 'id' })
  id: number;

  @Column({ type: 'enum', enum: AZEYO_COMMUNITY_POST_TYPE, name: 'type' })
  type: AZEYO_COMMUNITY_POST_TYPE;

  @Column({ type: 'enum', enum: AZEYO_COMMUNITY_CATEGORY, name: 'category' })
  category: AZEYO_COMMUNITY_CATEGORY;

  @ManyToOne(() => AzeyoUser)
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: AzeyoUser;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'title' })
  title: string;

  @Column({ type: 'text', name: 'contents' })
  contents: string;

  @Column({ type: 'jsonb', name: 'image_urls', nullable: true })
  imageUrls: string[] | null;

  @Column({ type: 'varchar', name: 'image_ratio', nullable: true })
  imageRatio: string | null;

  @Column({ type: 'varchar', name: 'vote_option_a', nullable: true })
  voteOptionA: string | null;

  @Column({ type: 'varchar', name: 'vote_option_b', nullable: true })
  voteOptionB: string | null;

  @Column({ type: 'int', name: 'view_count', default: 0 })
  viewCount: number;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp', name: 'deleted_at', nullable: true })
  deletedAt: Date | null;

  // Non-mapped aggregated fields
  likesCount: number = 0;
  commentsCount: number = 0;
  voteCountA: number = 0;
  voteCountB: number = 0;
  isLiked: boolean = false;
  userVote: 'A' | 'B' | null = null;

  constructor(init?: Partial<AzeyoCommunityPost>) {
    super();
    if (init) Object.assign(this, init);
  }
}
