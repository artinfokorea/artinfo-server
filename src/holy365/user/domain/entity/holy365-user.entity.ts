import { BaseEntity, Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export enum HOLY365_LOCALE {
  KO = 'ko',
  EN = 'en',
}

@Entity('holy365_users')
export class Holy365User extends BaseEntity {
  @PrimaryGeneratedColumn('increment', { name: 'id' })
  id: number;

  @Column({ type: 'varchar', name: 'name', length: 30 })
  name: string;

  @Column({ type: 'varchar', name: 'email', nullable: true })
  email: string | null;

  /** google | kakao | naver (로컬 개발 로그인은 dev) */
  @Column({ type: 'varchar', name: 'sns_type', length: 16 })
  snsType: string;

  @Column({ type: 'varchar', name: 'sns_id' })
  snsId: string;

  @Column({ type: 'varchar', name: 'icon_image_url', nullable: true })
  iconImageUrl: string | null;

  @Column({ type: 'varchar', name: 'locale', length: 8, default: HOLY365_LOCALE.KO })
  locale: string;

  @Column({ type: 'int', name: 'church_id', nullable: true })
  churchId: number | null;

  /** false 면 다른 사람에게 진행 상황(통계·잔디·성경 지도)을 보여주지 않는다 */
  @Column({ type: 'boolean', name: 'profile_public', default: true })
  profilePublic: boolean;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp', name: 'deleted_at', nullable: true })
  deletedAt: Date | null;
}
