import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AzeyoUser } from '@/azeyo/user/domain/entity/azeyo-user.entity';
import { AzeyoScheduleTag } from '@/azeyo/schedule/domain/entity/azeyo-schedule-tag.entity';

export enum AZEYO_SCHEDULE_REPEAT_TYPE {
  NONE = 'NONE',
  YEARLY = 'YEARLY',
}

@Entity('azeyo_schedules')
export class AzeyoSchedule extends BaseEntity {
  @PrimaryGeneratedColumn('increment', { name: 'id' })
  id: number;

  @ManyToOne(() => AzeyoUser)
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: AzeyoUser;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'title' })
  title: string;

  @Column({ type: 'date', name: 'date' })
  date: string;

  @Column({ type: 'varchar', name: 'memo', nullable: true })
  memo: string | null;

  @Column({
    type: 'varchar',
    name: 'repeat_type',
    default: AZEYO_SCHEDULE_REPEAT_TYPE.NONE,
  })
  repeatType: AZEYO_SCHEDULE_REPEAT_TYPE;

  @Column({ type: 'date', name: 'start_date', nullable: true })
  startDate: string | null;

  @ManyToMany(() => AzeyoScheduleTag, { eager: true })
  @JoinTable({
    name: 'azeyo_schedule_tag_map',
    joinColumn: { name: 'schedule_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'tag_id', referencedColumnName: 'id' },
  })
  tags: AzeyoScheduleTag[];

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @DeleteDateColumn({ type: 'timestamp', name: 'deleted_at', nullable: true })
  deletedAt: Date | null;

  constructor(init?: Partial<AzeyoSchedule>) {
    super();
    if (init) Object.assign(this, init);
  }
}
