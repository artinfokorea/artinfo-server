import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('vl_word_example_sentences')
export class VlWordExampleSentence {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'master_word_id', type: 'uuid' })
  masterWordId: string;

  @Column({ name: 'sentence', type: 'text' })
  sentence: string;

  @Column({ name: 'sentence_with_blank', type: 'text' })
  sentenceWithBlank: string;

  @Column({ name: 'blank_answer', length: 100 })
  blankAnswer: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt: Date | null;
}
