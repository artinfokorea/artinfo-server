import { BaseEntity, Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
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

  @Column({ type: 'int', name: 'sequence', nullable: true })
  sequence: number | null;

  @OneToMany(() => JobProvince, jobProvince => jobProvince.province)
  jobProvinces: JobProvince[];

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;
}
