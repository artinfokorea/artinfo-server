import { BaseEntity, Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export const HOLY365_EMAIL_TYPE = 'email';

export enum HOLY365_LOCALE {
  KO = 'ko',
  ZH = 'zh',
}

@Entity('holy365_users')
export class Holy365User extends BaseEntity {
  @PrimaryGeneratedColumn('increment', { name: 'id' })
  id: number;

  @Column({ type: 'varchar', name: 'name', length: 30 })
  name: string;

  @Column({ type: 'varchar', name: 'email', nullable: true })
  email: string | null;

  @Column({ type: 'varchar', name: 'password_hash', nullable: true, select: false })
  passwordHash: string | null;

  /** 'email' | google | kakao | naver */
  @Column({ type: 'varchar', name: 'sns_type', length: 16 })
  snsType: string;

  @Column({ type: 'varchar', name: 'sns_id' })
  snsId: string;

  @Column({ type: 'varchar', name: 'icon_image_url', nullable: true })
  iconImageUrl: string | null;

  @Column({ type: 'varchar', name: 'locale', length: 8, default: HOLY365_LOCALE.KO })
  locale: string;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp', name: 'deleted_at', nullable: true })
  deletedAt: Date | null;
}
