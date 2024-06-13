import { BaseEntity, Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { LessonProvince } from '@/lesson/entity/lesson-province.entity';
import { JobProvince } from '@/job/entity/job-province.entity';

@Entity('provinces')
export class Province extends BaseEntity {
  @PrimaryGeneratedColumn('increment', { name: 'id' })
  id: number;

  @Column({ type: 'smallint', name: 'depth' })
  depth: number;

  @Column({ type: 'varchar', name: 'name' })
  name: string;

  @Column({ type: 'int', name: 'parent_id', nullable: true })
  parentId: number | null;

  @OneToMany(() => JobProvince, jobProvince => jobProvince.province)
  jobProvinces: JobProvince[];

  @OneToMany(() => LessonProvince, lessonProvince => lessonProvince.province)
  lessonProvinces: LessonProvince[];

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;
}
