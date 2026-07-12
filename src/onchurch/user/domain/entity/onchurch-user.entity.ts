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

  // 위저드(임시비밀번호)로 생성된 계정이 최초 로그인 시 비밀번호 변경을 강제당하는지 여부.
  // 비밀번호를 한 번이라도 변경/재설정하면 false로 소비된다.
  @Column({ type: 'boolean', name: 'must_change_password', default: false })
  mustChangePassword: boolean;

  @Column({ type: 'varchar', name: 'referral_source', nullable: true })
  referralSource: string | null;

  @Column({ type: 'varchar', name: 'referral_source_etc', nullable: true })
  referralSourceEtc: string | null;

  @Column({ type: 'timestamp', name: 'free_trial_until', nullable: true })
  freeTrialUntil: Date | null;

  @Column({ type: 'timestamp', name: 'paid_until', nullable: true })
  paidUntil: Date | null;

  // 테스트용 계정 여부. true면 마스터 대시보드 통계에서 해당 유저와 그 교회를 제외한다.
  @Column({ type: 'boolean', name: 'is_test', default: false })
  isTest: boolean;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp', name: 'deleted_at', nullable: true })
  deletedAt: Date | null;
}
