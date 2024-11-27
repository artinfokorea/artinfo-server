import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Job } from '@/job/entity/job.entity';

@Entity('job_schedules')
export class JobSchedule {
  @PrimaryGeneratedColumn('increment', { name: 'id' })
  id: number;

  @Column({ type: 'timestamp', name: 'start_at' })
  startAt: Date;

  @Column({ type: 'timestamp', name: 'end_at' })
  endAt: Date;

  @ManyToOne(() => Job, job => job.schedules, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'job_id', referencedColumnName: 'id' })
  job: Job;

  @Column({ name: 'job_id' })
  jobId: number;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;
}
