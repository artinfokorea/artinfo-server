import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export enum AUTH_TYPE {
  EMAIL = 'EMAIL',
  KAKAO = 'KAKAO',
  NAVER = 'NAVER',
  GOOGLE = 'GOOGLE',
}

export interface AuthCreator {
  type: AUTH_TYPE;
  userId: number;
  accessToken: string;
  accessTokenExpiresIn: Date;
  refreshToken: string;
  refreshTokenExpiresIn: Date;
}

@Entity('auths')
export class Auth extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'enum', enum: AUTH_TYPE, name: 'type' })
  type: AUTH_TYPE;

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
  updateAt: Date;

  constructor(creator: AuthCreator) {
    super();
    if (creator) {
      this.type = creator.type;
      this.userId = creator.userId;
      this.accessToken = creator.accessToken;
      this.accessTokenExpiresIn = creator.accessTokenExpiresIn;
      this.refreshToken = creator.refreshToken;
      this.refreshTokenExpiresIn = creator.refreshTokenExpiresIn;
    }
  }
}
