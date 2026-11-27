import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('holy365_auths')
export class Holy365Auth extends BaseEntity {
  @PrimaryGeneratedColumn('increment', { name: 'id' })
  id: number;

  @Column({ type: 'int', name: 'user_id' })
  userId: number;

  @Column({ type: 'varchar', name: 'access_token' })
  accessToken: string;

  @Column({ type: 'timestamp', name: 'access_token_expires_in' })
  accessTokenExpiresIn: Date;

  @Column({ type: 'varchar', name: 'refresh_token' })
  refreshToken: string;

  @Column({ type: 'timestamp', name: 'refresh_token_expires_in' })
  refreshTokenExpiresIn: Date;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;
}
