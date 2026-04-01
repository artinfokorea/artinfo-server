import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export enum AZEYO_AUTH_TYPE {
  KAKAO = 'KAKAO',
  NAVER = 'NAVER',
  GOOGLE = 'GOOGLE',
}

export enum AZEYO_SNS_TYPE {
  KAKAO = 'KAKAO',
  NAVER = 'NAVER',
  GOOGLE = 'GOOGLE',
}

export interface AzeyoAuthCreator {
  type: AZEYO_AUTH_TYPE;
  userId: number;
}

@Entity('azeyo_auths')
export class AzeyoAuth extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'enum', enum: AZEYO_AUTH_TYPE, name: 'type' })
  type: AZEYO_AUTH_TYPE;

  @Column({ name: 'user_id' })
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
