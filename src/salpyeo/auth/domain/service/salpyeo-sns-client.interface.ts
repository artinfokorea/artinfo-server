import { SALPYEO_SNS_TYPE } from '@/salpyeo/user/domain/entity/salpyeo-user.entity';

export const SALPYEO_SNS_CLIENT = Symbol('SALPYEO_SNS_CLIENT');

export interface SalpyeoSnsUserInfo {
  snsId: string;
  name: string | null;
  email: string | null;
  iconImageUrl: string | null;
}

export interface ISalpyeoSnsClient {
  getUserInfo(token: string, type: SALPYEO_SNS_TYPE): Promise<SalpyeoSnsUserInfo>;
}
