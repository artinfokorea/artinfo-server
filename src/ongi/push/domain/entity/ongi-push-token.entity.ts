import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

/** 기기의 Expo Push Token — 사용자당 여러 기기 가능. 로그아웃·토큰 만료 시 삭제 */
@Entity('ongi_push_tokens')
export class OngiPushToken extends BaseEntity {
  @PrimaryGeneratedColumn('increment', { name: 'id' })
  id: number;

  @Column({ type: 'int', name: 'user_id' })
  userId: number;

  /** ExponentPushToken[xxxx] */
  @Column({ type: 'varchar', name: 'token' })
  token: string;

  @Column({ type: 'varchar', name: 'platform', length: 16 })
  platform: string;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;
}
