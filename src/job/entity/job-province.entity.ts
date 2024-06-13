import { BaseEntity, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Job } from '@/job/entity/job.entity';
import { Province } from '@/lesson/entity/province.entity';

@Entity('jobs_provinces')
export class JobProvince extends BaseEntity {
  @PrimaryColumn({ name: 'job_id' })
  jobId: number;

  @PrimaryColumn({ name: 'province_id' })
  provinceId: number;

  @ManyToOne(() => Job, job => job.jobProvinces, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'job_id', referencedColumnName: 'id' })
  job: Job;

  @ManyToOne(() => Province, province => province.jobProvinces, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'province_id', referencedColumnName: 'id' })
  province: Province;
}
