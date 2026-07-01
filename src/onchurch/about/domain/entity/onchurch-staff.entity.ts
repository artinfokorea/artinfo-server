import { BaseEntity, Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('onchurch_staffs')
export class OnchurchStaff extends BaseEntity {
  @PrimaryGeneratedColumn('increment', { name: 'id' })
  id: number;

  @Column({ type: 'int', name: 'church_id' })
  churchId: number;

  @Column({ type: 'varchar', name: 'name', length: 80 })
  name: string;

  @Column({ type: 'varchar', name: 'role', nullable: true, length: 80 })
  role: string | null;

  @Column({ type: 'varchar', name: 'area', nullable: true, length: 200 })
  area: string | null;

  @Column({ type: 'varchar', name: 'photo_url', nullable: true, length: 1000 })
  photoUrl: string | null;

  @Column({ type: 'varchar', name: 'phone', nullable: true, length: 40 })
  phone: string | null;

  @Column({ type: 'varchar', name: 'email', nullable: true, length: 200 })
  email: string | null;

  @Column({ type: 'int', name: 'sort_order', default: 0 })
  sortOrder: number;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp', name: 'deleted_at', nullable: true })
  deletedAt: Date | null;
}
