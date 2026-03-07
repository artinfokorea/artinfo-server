import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('vl_word_group_items')
export class VlWordGroupItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'word_group_id', type: 'uuid' })
  wordGroupId: string;

  @Column({ name: 'master_word_id', type: 'uuid' })
  masterWordId: string;

  @Column({ name: 'word_chapter_id', type: 'uuid' })
  wordChapterId: string;

  @Column({ name: 'word_step_id', type: 'uuid', nullable: true, default: null })
  wordStepId: string | null;

  @Column({ name: 'item_order' })
  itemOrder: number;

  @Column({ name: 'word_seq' })
  wordSeq: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt: Date | null;
}
