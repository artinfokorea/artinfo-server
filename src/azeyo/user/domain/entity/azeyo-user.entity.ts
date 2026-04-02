import { BaseEntity, Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('azeyo_users')
export class AzeyoUser extends BaseEntity {
  @PrimaryGeneratedColumn('increment', { name: 'id' })
  id: number;

  @Column({ name: 'nickname' })
  nickname: string;

  @Column({ type: 'varchar', name: 'subtitle', nullable: true })
  subtitle: string | null;

  @Column({ type: 'int', name: 'marriage_year' })
  marriageYear: number;

  @Column({ name: 'children', default: '0' })
  children: string;

  @Column({ type: 'varchar', name: 'email', nullable: true, unique: true })
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

  @DeleteDateColumn({ type: 'timestamp', name: 'deleted_at', nullable: true })
  deletedAt: Date | null;

  // Non-mapped aggregated fields
  postsCount: number = 0;
  likesCount: number = 0;
  jokboCount: number = 0;
}
