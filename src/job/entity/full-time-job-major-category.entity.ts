import { BaseEntity, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { FullTimeJob } from '@/job/entity/full-time-job.entity';
import { MajorCategory } from '@/job/entity/major-category.entity';

@Entity('full_time_job_major_categories')
export class FullTimeJobMajorCategory extends BaseEntity {
  @PrimaryColumn({ name: 'full_time_job_id' })
  fullTimeJobId: number;

  @PrimaryColumn({ name: 'major_category_id' })
  majorCategoryId: number;

  @ManyToOne(() => FullTimeJob, fullTimeJob => fullTimeJob.fullTimeJobMajorCategories, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'full_time_job_id', referencedColumnName: 'id' })
  fullTimeJob: FullTimeJob;

  @ManyToOne(() => MajorCategory, majorCategory => majorCategory.fullTimeJobMajorCategories, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'major_category_id', referencedColumnName: 'id' })
  majorCategory: MajorCategory;
}
