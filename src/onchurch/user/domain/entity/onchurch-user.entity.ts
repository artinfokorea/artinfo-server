import { BaseEntity, Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export enum ONCHURCH_USER_ROLE {
  MASTER = 'master',
  OWNER = 'owner',
  ADMIN = 'admin',
  MEMBER = 'member',
}

@Entity('onchurch_users')
export class OnchurchUser extends BaseEntity {
  @PrimaryGeneratedColumn('increment', { name: 'id' })
  id: number;

  @Column({ type: 'varchar', name: 'login_id', unique: true })
  loginId: string;

  @Column({ type: 'varchar', name: 'password' })
  password: string;

  @Column({ type: 'varchar', name: 'name' })
  name: string;

  @Column({ type: 'varchar', name: 'phone' })
  phone: string;

  @Column({ type: 'enum', enum: ONCHURCH_USER_ROLE, name: 'role', default: ONCHURCH_USER_ROLE.MEMBER })
  role: ONCHURCH_USER_ROLE;

  @Column({ type: 'varchar', name: 'church_name', nullable: true })
  churchName: string | null;

  @Column({ type: 'int', name: 'church_id', nullable: true })
  churchId: number | null;

  @Column({ type: 'boolean', name: 'marketing_consent', default: false })
  marketingConsent: boolean;

  @Column({ type: 'varchar', name: 'referral_source', nullable: true })
  referralSource: string | null;

  @Column({ type: 'varchar', name: 'referral_source_etc', nullable: true })
  referralSourceEtc: string | null;

  @Column({ type: 'timestamp', name: 'free_trial_until', nullable: true })
  freeTrialUntil: Date | null;

  @Column({ type: 'timestamp', name: 'paid_until', nullable: true })
  paidUntil: Date | null;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp', name: 'deleted_at', nullable: true })
  deletedAt: Date | null;
}
