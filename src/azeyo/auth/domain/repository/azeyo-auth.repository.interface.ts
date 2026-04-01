import { AzeyoAuth, AzeyoAuthCreator } from '@/azeyo/auth/domain/entity/azeyo-auth.entity';
import { AzeyoUser } from '@/azeyo/user/domain/entity/azeyo-user.entity';

export const AZEYO_AUTH_REPOSITORY = Symbol('AZEYO_AUTH_REPOSITORY');

export interface IAzeyoAuthRepository {
  create(creator: AzeyoAuthCreator, user: AzeyoUser): Promise<AzeyoAuth>;
  renewAccessToken(user: AzeyoUser, accessToken: string, refreshToken: string): Promise<AzeyoAuth>;
  renewTokens(user: AzeyoUser, accessToken: string, refreshToken: string): Promise<AzeyoAuth>;
}
