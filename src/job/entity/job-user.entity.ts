import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '@/user/entity/user.entity';
import { Job } from '@/job/entity/job.entity';

@Entity('jobs_users')
export class JobUser {
  @PrimaryGeneratedColumn('increment', { name: 'id' })
  id: number;

  @PrimaryColumn({ name: 'user_id' })
  userId: number;

  @PrimaryColumn({ name: 'job_id' })
  jobId: number;

  @ManyToOne(() => User, user => user.jobUsers, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: User;

  @ManyToOne(() => Job, job => job.jobUsers, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'job_id', referencedColumnName: 'id' })
  job: Job;

  @Column({ type: 'varchar', name: 'profile' })
  profile: string;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;
}
