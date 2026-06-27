import { BaseEntity, Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export type OnchurchSaintGender = 'male' | 'female';

@Entity('onchurch_saints')
export class OnchurchSaint extends BaseEntity {
  @PrimaryGeneratedColumn('increment', { name: 'id' })
  id: number;

  @Column({ type: 'int', name: 'church_id' })
  churchId: number;

  @Column({ type: 'varchar', name: 'name', length: 80 })
  name: string;

  @Column({ type: 'varchar', name: 'photo_url', nullable: true, length: 1000 })
  photoUrl: string | null;

  @Column({ type: 'varchar', name: 'birth_date', nullable: true, length: 10 })
  birthDate: string | null;

  @Column({ type: 'varchar', name: 'gender', nullable: true, length: 10 })
  gender: OnchurchSaintGender | null;

  @Column({ type: 'varchar', name: 'phone', nullable: true, length: 40 })
  phone: string | null;

  @Column({ type: 'varchar', name: 'email', nullable: true, length: 200 })
  email: string | null;

  @Column({ type: 'varchar', name: 'address', nullable: true, length: 500 })
  address: string | null;

  @Column({ type: 'varchar', name: 'position', nullable: true, length: 40 })
  position: string | null;

  @Column({ type: 'varchar', name: 'ordination_date', nullable: true, length: 10 })
  ordinationDate: string | null;

  @Column({ type: 'varchar', name: 'faith_level', nullable: true, length: 40 })
  faithLevel: string | null;

  // 관리자용 자유 메모.
  @Column({ type: 'text', name: 'memo', nullable: true })
  memo: string | null;

  // 출석체크 등에서 상단 고정용 즐겨찾기.
  @Column({ type: 'boolean', name: 'is_favorite', default: false })
  isFavorite: boolean;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp', name: 'deleted_at', nullable: true })
  deletedAt: Date | null;
}
