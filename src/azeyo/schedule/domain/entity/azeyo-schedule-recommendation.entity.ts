import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AzeyoScheduleTag } from '@/azeyo/schedule/domain/entity/azeyo-schedule-tag.entity';

export interface RecommendationItem {
  rank: number;
  name: string;
  description: string;
  emoji: string;
}

@Entity('azeyo_schedule_recommendations')
export class AzeyoScheduleRecommendation extends BaseEntity {
  @PrimaryGeneratedColumn('increment', { name: 'id' })
  id: number;

  @ManyToOne(() => AzeyoScheduleTag)
  @JoinColumn({ name: 'tag_id', referencedColumnName: 'id' })
  tag: AzeyoScheduleTag;

  @Column({ name: 'tag_id' })
  tagId: number;

  @Column({ name: 'title' })
  title: string;

  @Column({ type: 'jsonb', name: 'items' })
  items: RecommendationItem[];
}
