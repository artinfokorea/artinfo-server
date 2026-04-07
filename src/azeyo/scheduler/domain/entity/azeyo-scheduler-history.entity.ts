import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum AZEYO_SCHEDULER_STATUS {
  SUCCESS = 'SUCCESS',
  FAILURE = 'FAILURE',
  SKIPPED = 'SKIPPED',
}

@Entity('azeyo_scheduler_histories')
export class AzeyoSchedulerHistory extends BaseEntity {
  @PrimaryGeneratedColumn('increment', { name: 'id' })
  id: number;

  @Column({ type: 'varchar', name: 'scheduler_name' })
  schedulerName: string;

  @Column({ type: 'varchar', name: 'status' })
  status: AZEYO_SCHEDULER_STATUS;

  @Column({ type: 'text', name: 'result', nullable: true })
  result: string | null;

  @Column({ type: 'text', name: 'error_message', nullable: true })
  errorMessage: string | null;

  @Column({ type: 'int', name: 'duration_ms' })
  durationMs: number;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;
}
