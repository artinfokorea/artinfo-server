import { BaseEntity, Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

/** 살펴 웹은 구글 로그인만 제공한다 (다른 제공자가 붙으면 여기에 추가) */
export enum SALPYEO_SNS_TYPE {
  GOOGLE = 'google',
}

export interface SalpyeoUserCreator {
  name: string;
  snsType: SALPYEO_SNS_TYPE;
  snsId: string;
  email: string | null;
  iconImageUrl: string | null;
}

@Entity('salpyeo_users')
export class SalpyeoUser extends BaseEntity {
  @PrimaryGeneratedColumn('increment', { name: 'id' })
  id: number;

  @Column({ type: 'varchar', name: 'name', length: 40 })
  name: string;

  @Column({ type: 'varchar', name: 'sns_type', length: 16 })
  snsType: string;

  @Column({ type: 'varchar', name: 'sns_id' })
  snsId: string;

  @Column({ type: 'varchar', name: 'email', nullable: true })
  email: string | null;

  @Column({ type: 'varchar', name: 'icon_image_url', nullable: true })
  iconImageUrl: string | null;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp', name: 'deleted_at', nullable: true })
  deletedAt: Date | null;
}
