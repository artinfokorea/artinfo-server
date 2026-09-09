import { SalpyeoAuth, SalpyeoAuthCreator } from '@/salpyeo/auth/domain/entity/salpyeo-auth.entity';
import { SalpyeoUser } from '@/salpyeo/user/domain/entity/salpyeo-user.entity';

export const SALPYEO_AUTH_REPOSITORY = Symbol('SALPYEO_AUTH_REPOSITORY');

export interface ISalpyeoAuthRepository {
  create(creator: SalpyeoAuthCreator, user: SalpyeoUser): Promise<SalpyeoAuth>;
  /** access token 만 새로 발급 (refresh token 은 그대로) */
  renewAccessToken(user: SalpyeoUser, accessToken: string, refreshToken: string): Promise<SalpyeoAuth>;
  /** refresh token 만료가 가까우면 둘 다 새로 발급 */
  renewTokens(user: SalpyeoUser, accessToken: string, refreshToken: string): Promise<SalpyeoAuth>;
  deleteByUserId(userId: number): Promise<void>;
}
