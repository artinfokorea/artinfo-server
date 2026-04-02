import {
  BaseEntity,
  Column,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

@Entity('azeyo_notification_settings')
@Unique(['userId'])
export class AzeyoNotificationSetting extends BaseEntity {
  @PrimaryGeneratedColumn('increment', { name: 'id' })
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ type: 'boolean', name: 'schedule_enabled', default: true })
  scheduleEnabled: boolean;

  @Column({ type: 'boolean', name: 'comment_enabled', default: true })
  commentEnabled: boolean;

  @Column({ type: 'boolean', name: 'like_enabled', default: true })
  likeEnabled: boolean;

  @Column({ type: 'boolean', name: 'jokbo_copy_enabled', default: false })
  jokboCopyEnabled: boolean;

  @Column({ type: 'boolean', name: 'community_enabled', default: false })
  communityEnabled: boolean;

  @Column({ type: 'boolean', name: 'marketing_enabled', default: true })
  marketingEnabled: boolean;
}
