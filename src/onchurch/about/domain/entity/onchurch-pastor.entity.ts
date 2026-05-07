import { BaseEntity, Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('onchurch_pastors')
export class OnchurchPastor extends BaseEntity {
  @PrimaryGeneratedColumn('increment', { name: 'id' })
  id: number;

  @Column({ type: 'int', name: 'church_id', unique: true })
  churchId: number;

  @Column({ type: 'varchar', name: 'name', length: 80 })
  name: string;

  @Column({ type: 'varchar', name: 'role', nullable: true, length: 80 })
  role: string | null;

  @Column({ type: 'varchar', name: 'eng', nullable: true, length: 80 })
  eng: string | null;

  @Column({ type: 'text', name: 'message', nullable: true })
  message: string | null;

  @Column({ type: 'text', name: 'long_message', nullable: true })
  longMessage: string | null;

  @Column({ type: 'varchar', name: 'photo_url', nullable: true, length: 1000 })
  photoUrl: string | null;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp', name: 'deleted_at', nullable: true })
  deletedAt: Date | null;
}
