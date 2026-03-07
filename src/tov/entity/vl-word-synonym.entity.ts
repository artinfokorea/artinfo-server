import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('vl_word_synonyms')
export class VlWordSynonym {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'master_word_id', type: 'uuid' })
  masterWordId: string;

  @Column({ name: 'synonym', length: 100 })
  synonym: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt: Date | null;
}
