import { BaseEntity, Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

/** 앱과 동일한 소문자 값을 사용 */
export enum ONGI_MEMBER_ROLE {
  ADMIN = 'admin',
  MEMBER = 'member',
  PENDING = 'pending',
}

export interface OngiMemberCreator {
  groupId: number;
  userId: number;
  name: string;
  role: ONGI_MEMBER_ROLE;
  avatarUrl: string | null;
}

/** 그룹 구성원 — 호칭(name)은 그룹마다 다를 수 있어 사용자(user)와 별개 레코드입니다 */
@Entity('ongi_members')
export class OngiMember extends BaseEntity {
  @PrimaryGeneratedColumn('increment', { name: 'id' })
  id: number;

  @Column({ type: 'int', name: 'group_id' })
  groupId: number;

  @Column({ type: 'int', name: 'user_id' })
  userId: number;

  @Column({ type: 'varchar', name: 'name' })
  name: string;

  @Column({ type: 'varchar', name: 'role', length: 16, default: ONGI_MEMBER_ROLE.MEMBER })
  role: string;

  @Column({ type: 'varchar', name: 'avatar_url', nullable: true })
  avatarUrl: string | null;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp', name: 'deleted_at', nullable: true })
  deletedAt: Date | null;
}
