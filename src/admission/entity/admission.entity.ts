import { BaseEntity, Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { MajorCategory } from '@/job/entity/major-category.entity';
import { AdmissionRound } from '@/admission/entity/admission-round.entity';

export enum ADMISSION_TYPE {
  GENERAL = 'GENERAL',
  SPECIAL = 'SPECIAL',
}

@Entity('admissions')
export class Admission extends BaseEntity {
  @PrimaryGeneratedColumn('increment', { name: 'id' })
  id: number;

  @Column({ type: 'enum', enum: ADMISSION_TYPE, name: 'type' })
  type: ADMISSION_TYPE;

  @Column({ type: 'smallint', name: 'year' })
  year: number;

  @Column({ type: 'varchar', name: 'school_name' })
  schoolName: string;

  @Column({ type: 'timestamp', name: 'application_start_at' })
  applicationStartAt: Date;

  @Column({ type: 'timestamp', name: 'application_end_at' })
  applicationEndAt: Date;

  @Column({ type: 'varchar', name: 'application_note', nullable: true })
  applicationNote: string | null;

  @Column({ type: 'timestamp', name: 'document_start_at', nullable: true })
  documentStartAt: Date | null;

  @Column({ type: 'timestamp', name: 'document_end_at', nullable: true })
  documentEndAt: Date | null;

  @Column({ type: 'varchar', name: 'document_note', nullable: true })
  documentNote: string | null;

  @Column({ type: 'timestamp', name: 'final_result_at', nullable: true })
  finalResultAt: Date | null;

  @ManyToOne(() => MajorCategory, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'major_category_id', referencedColumnName: 'id' })
  majorCategory: MajorCategory;

  @Column({ name: 'major_category_id' })
  majorCategoryId: number;

  @OneToMany(() => AdmissionRound, round => round.admission, { cascade: true })
  rounds: AdmissionRound[];

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;
}
