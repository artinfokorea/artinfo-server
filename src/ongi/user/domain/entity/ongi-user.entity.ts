import { BaseEntity, Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export enum ONGI_SNS_TYPE {
  KAKAO = 'kakao',
  NAVER = 'naver',
  GOOGLE = 'google',
  APPLE = 'apple',
}

export interface OngiUserCreator {
  name: string;
  snsType: ONGI_SNS_TYPE;
  snsId: string;
  iconImageUrl: string | null;
  email: string | null;
}

@Entity('ongi_users')
export class OngiUser extends BaseEntity {
  @PrimaryGeneratedColumn('increment', { name: 'id' })
  id: number;

  @Column({ type: 'varchar', name: 'name' })
  name: string;

  @Column({ type: 'varchar', name: 'sns_type', length: 16 })
  snsType: string;

  @Column({ type: 'varchar', name: 'sns_id' })
  snsId: string;

  @Column({ type: 'varchar', name: 'icon_image_url', nullable: true })
  iconImageUrl: string | null;

  @Column({ type: 'varchar', name: 'email', nullable: true })
  email: string | null;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp', name: 'deleted_at', nullable: true })
  deletedAt: Date | null;
}
