import { BaseEntity, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Job } from '@/job/entity/job.entity';
import { MajorCategory } from '@/job/entity/major-category.entity';

@Entity('jobs_major_categories')
export class jobMajorCategory extends BaseEntity {
  @PrimaryColumn({ name: 'job_id' })
  jobId: number;

  @PrimaryColumn({ name: 'major_category_id' })
  majorCategoryId: number;

  @ManyToOne(() => Job, job => job.jobMajorCategories, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'job_id', referencedColumnName: 'id' })
  job: Job;

  @ManyToOne(() => MajorCategory, majorCategory => majorCategory.jobMajorCategories, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'major_category_id', referencedColumnName: 'id' })
  majorCategory: MajorCategory;
}
