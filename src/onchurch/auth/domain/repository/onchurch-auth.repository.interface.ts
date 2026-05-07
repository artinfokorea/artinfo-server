import { OnchurchAuth, OnchurchAuthCreator } from '@/onchurch/auth/domain/entity/onchurch-auth.entity';
import { OnchurchUser } from '@/onchurch/user/domain/entity/onchurch-user.entity';

export const ONCHURCH_AUTH_REPOSITORY = Symbol('ONCHURCH_AUTH_REPOSITORY');

export interface IOnchurchAuthRepository {
  create(creator: OnchurchAuthCreator, user: OnchurchUser): Promise<OnchurchAuth>;
  renewAccessToken(user: OnchurchUser, accessToken: string, refreshToken: string): Promise<OnchurchAuth>;
  renewTokens(user: OnchurchUser, accessToken: string, refreshToken: string): Promise<OnchurchAuth>;
}
