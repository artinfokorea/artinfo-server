import { ONGI_SNS_TYPE } from '@/ongi/user/domain/entity/ongi-user.entity';

export const ONGI_SNS_CLIENT = Symbol('ONGI_SNS_CLIENT');

export interface OngiSnsUserInfo {
  snsId: string;
  name: string | null;
  email: string | null;
  iconImageUrl: string | null;
}

export interface IOngiSnsClient {
  getUserInfo(token: string, type: ONGI_SNS_TYPE): Promise<OngiSnsUserInfo>;
}
