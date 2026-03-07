import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('vl_word_groups')
export class VlWordGroup {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'service_name', length: 50 })
  serviceName: string;

  @Column({ name: 'name', length: 100 })
  name: string;

  @Column({ name: 'description', type: 'text', nullable: true, default: null })
  description: string | null;

  @Column({ name: 'range_selection_type', length: 20 })
  rangeSelectionType: string;

  @Column({ name: 'enable_meaning' })
  enableMeaning: boolean;

  @Column({ name: 'enable_spelling' })
  enableSpelling: boolean;

  @Column({ name: 'enable_synonym_antonym' })
  enableSynonymAntonym: boolean;

  @Column({ name: 'enable_context' })
  enableContext: boolean;

  @Column({ name: 'enable_study' })
  enableStudy: boolean;

  @Column({ name: 'pass_percentage_total' })
  passPercentageTotal: number;

  @Column({ name: 'pass_percentage_meaning' })
  passPercentageMeaning: number;

  @Column({ name: 'pass_percentage_spelling' })
  passPercentageSpelling: number;

  @Column({ name: 'pass_percentage_synonym_antonym' })
  passPercentageSynonymAntonym: number;

  @Column({ name: 'pass_percentage_context' })
  passPercentageContext: number;

  @Column({ name: 'chapter_name', type: 'varchar', nullable: true })
  chapterName: string | null;

  @Column({ name: 'step_name', type: 'varchar', nullable: true })
  stepName: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt: Date | null;
}
