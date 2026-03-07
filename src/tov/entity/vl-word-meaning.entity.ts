import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('vl_word_meanings')
export class VlWordMeaning {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'master_word_id', type: 'uuid' })
  masterWordId: string;

  @Column({ name: 'korean_meaning', length: 200 })
  koreanMeaning: string;

  @Column({ name: 'display_order' })
  displayOrder: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt: Date | null;
}
