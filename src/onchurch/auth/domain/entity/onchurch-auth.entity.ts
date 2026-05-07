import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export interface OnchurchAuthCreator {
  userId: number;
}

@Entity('onchurch_auths')
export class OnchurchAuth extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ type: 'text', name: 'access_token' })
  accessToken: string;

  @Column({ type: 'timestamp', name: 'access_token_expires_in' })
  accessTokenExpiresIn: Date;

  @Column({ type: 'text', name: 'refresh_token' })
  refreshToken: string;

  @Column({ type: 'timestamp', name: 'refresh_token_expires_in' })
  refreshTokenExpiresIn: Date;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;
}
