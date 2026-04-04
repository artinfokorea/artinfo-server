import { BaseEntity, Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('azeyo_users')
export class AzeyoUser extends BaseEntity {
  @PrimaryGeneratedColumn('increment', { name: 'id' })
  id: number;

  @Column({ name: 'nickname' })
  nickname: string;

  @Column({ type: 'varchar', name: 'subtitle', nullable: true })
  subtitle: string | null;

  @Column({ type: 'date', name: 'marriage_date', nullable: true })
  marriageDate: string | null;

  @Column({ name: 'children', default: '0' })
  children: string;

  @Column({ type: 'varchar', name: 'gender', nullable: true })
  gender: string | null;

  @Column({ type: 'varchar', name: 'age_range', nullable: true })
  ageRange: string | null;

  @Column({ type: 'date', name: 'birth_date', nullable: true })
  birthDate: string | null;

  @Column({ type: 'varchar', name: 'phone', nullable: true })
  phone: string | null;

  @Column({ type: 'varchar', name: 'email', nullable: true })
  email: string | null;

  @Column({ type: 'varchar', name: 'sns_type', nullable: true })
  snsType: string | null;

  @Column({ type: 'varchar', name: 'sns_id', nullable: true })
  snsId: string | null;

  @Column({ type: 'varchar', name: 'icon_image_url', nullable: true })
  iconImageUrl: string | null;

  @Column({ type: 'int', name: 'activity_points', default: 0 })
  activityPoints: number;

  @Column({ type: 'int', name: 'monthly_points', default: 0 })
  monthlyPoints: number;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;

  @Column({ type: 'boolean', name: 'marketing_consent', default: false })
  marketingConsent: boolean;

  @Column({ type: 'boolean', name: 'is_online', default: false })
  isOnline: boolean;

  @Column({ type: 'timestamp', name: 'last_seen_at', nullable: true })
  lastSeenAt: Date | null;

  @DeleteDateColumn({ type: 'timestamp', name: 'deleted_at', nullable: true })
  deletedAt: Date | null;

  // Non-mapped aggregated fields
  postsCount: number = 0;
  likesCount: number = 0;
  jokboCount: number = 0;
}
