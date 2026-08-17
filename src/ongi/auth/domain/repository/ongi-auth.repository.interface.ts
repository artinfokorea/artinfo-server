import { OngiAuth, OngiAuthCreator } from '@/ongi/auth/domain/entity/ongi-auth.entity';
import { OngiUser } from '@/ongi/user/domain/entity/ongi-user.entity';

export const ONGI_AUTH_REPOSITORY = Symbol('ONGI_AUTH_REPOSITORY');

export interface IOngiAuthRepository {
  create(creator: OngiAuthCreator, user: OngiUser): Promise<OngiAuth>;
  renewAccessToken(user: OngiUser, accessToken: string, refreshToken: string): Promise<OngiAuth>;
  renewTokens(user: OngiUser, accessToken: string, refreshToken: string): Promise<OngiAuth>;
  deleteByUserId(userId: number): Promise<void>;
}
