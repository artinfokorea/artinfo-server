import { BaseEntity, Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { JobMajorCategory } from '@/job/entity/job-major-category.entity';
import { User } from '@/user/entity/user.entity';
import { JobProvince } from '@/job/entity/job-province.entity';

export enum JOB_TYPE {
  ART_ORGANIZATION = 'ART_ORGANIZATION',
  RELIGION = 'RELIGION',
  LECTURER = 'LECTURER',
  PART_TIME = 'PART_TIME',
}

@Entity('jobs')
export class Job extends BaseEntity {
  @PrimaryGeneratedColumn('increment', { name: 'id' })
  id: number;

  @Column({ name: 'type' })
  type: JOB_TYPE;

  @Column({ type: 'varchar', name: 'title' })
  title: string;

  @Column({ type: 'varchar', name: 'company_name' })
  companyName: string;

  @Column({ type: 'varchar', name: 'contents' })
  contents: string;

  @Column({ type: 'varchar', name: 'address', nullable: true })
  address: string | null;

  @Column({ type: 'varchar', name: 'address_detail', nullable: true })
  addressDetail: string | null;

  @Column({ type: 'int', name: 'fee', nullable: true })
  fee: number | null;

  @Column({ type: 'varchar', name: 'image_url', nullable: true })
  imageUrl: string | null;

  @Column({ type: 'boolean', name: 'is_active', default: true })
  isActive: boolean;

  @OneToMany(() => JobProvince, jobProvince => jobProvince.job, { cascade: true })
  jobProvinces: JobProvince[];

  @OneToMany(() => JobMajorCategory, jobMajorCategory => jobMajorCategory.job, { eager: true, cascade: true })
  jobMajorCategories: JobMajorCategory[];

  @ManyToOne(() => User, user => user.jobs, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: User;

  @CreateDateColumn({ type: 'timestamp', name: 'start_at', nullable: true })
  startAt: Date | null;

  @CreateDateColumn({ type: 'timestamp', name: 'end_at', nullable: true })
  endAt: Date | null;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;
}
