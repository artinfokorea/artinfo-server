import { OngiPushToken } from '@/ongi/push/domain/entity/ongi-push-token.entity';

export const ONGI_PUSH_TOKEN_REPOSITORY = Symbol('ONGI_PUSH_TOKEN_REPOSITORY');

export interface IOngiPushTokenRepository {
  /** 같은 토큰이 다른 사용자에게 있었으면 현재 사용자로 옮긴다 (기기 공유·재로그인) */
  upsert(userId: number, token: string, platform: string): Promise<void>;
  deleteByToken(token: string): Promise<void>;
  deleteByTokens(tokens: string[]): Promise<void>;
  deleteByUserId(userId: number): Promise<void>;
  scanByUserIds(userIds: number[]): Promise<OngiPushToken[]>;
}
