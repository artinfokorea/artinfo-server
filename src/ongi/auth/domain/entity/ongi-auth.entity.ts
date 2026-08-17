import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { ONGI_SNS_TYPE } from '@/ongi/user/domain/entity/ongi-user.entity';

export interface OngiAuthCreator {
  type: ONGI_SNS_TYPE;
  userId: number;
}

@Entity('ongi_auths')
export class OngiAuth extends BaseEntity {
  @PrimaryGeneratedColumn('increment', { name: 'id' })
  id: number;

  @Column({ type: 'varchar', name: 'type', length: 16 })
  type: string;

  @Column({ type: 'int', name: 'user_id' })
  userId: number;

  @Column({ name: 'access_token' })
  accessToken: string;

  @Column({ type: 'timestamp', name: 'access_token_expires_in' })
  accessTokenExpiresIn: Date;

  @Column({ name: 'refresh_token' })
  refreshToken: string;

  @Column({ type: 'timestamp', name: 'refresh_token_expires_in' })
  refreshTokenExpiresIn: Date;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;
}
