import { AZEYO_SNS_TYPE } from '@/azeyo/auth/domain/entity/azeyo-auth.entity';
import { SnsUserInfo } from '@/azeyo/sns/domain/dto/sns-user-info';

export const AZEYO_SNS_CLIENT = Symbol('AZEYO_SNS_CLIENT');

export interface IAzeyoSnsClient {
  getUserInfo(token: string, type: AZEYO_SNS_TYPE): Promise<SnsUserInfo>;
}
