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

export enum AZEYO_JOKBO_CATEGORY {
  WIFE_BIRTHDAY = 'WIFE_BIRTHDAY',
  MOTHER_IN_LAW_BIRTHDAY = 'MOTHER_IN_LAW_BIRTHDAY',
  APOLOGY = 'APOLOGY',
  ANNIVERSARY = 'ANNIVERSARY',
  ENCOURAGEMENT = 'ENCOURAGEMENT',
}

@Entity('azeyo_jokbo_templates')
export class AzeyoJokboTemplate extends BaseEntity {
  @PrimaryGeneratedColumn('increment', { name: 'id' })
  id: number;

  @Column({ type: 'enum', enum: AZEYO_JOKBO_CATEGORY, name: 'category' })
  category: AZEYO_JOKBO_CATEGORY;

  @ManyToOne(() => AzeyoUser)
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: AzeyoUser;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'title' })
  title: string;

  @Column({ type: 'text', name: 'content' })
  content: string;

  @Column({ type: 'int', name: 'copy_count', default: 0 })
  copyCount: number;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp', name: 'deleted_at', nullable: true })
  deletedAt: Date | null;

  // Non-mapped aggregated fields
  likesCount: number = 0;
  isLiked: boolean = false;

  constructor(init?: Partial<AzeyoJokboTemplate>) {
    super();
    if (init) Object.assign(this, init);
  }
}
