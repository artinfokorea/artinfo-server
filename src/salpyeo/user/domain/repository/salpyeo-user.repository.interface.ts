import { SALPYEO_SNS_TYPE, SalpyeoUser, SalpyeoUserCreator } from '@/salpyeo/user/domain/entity/salpyeo-user.entity';

export const SALPYEO_USER_REPOSITORY = Symbol('SALPYEO_USER_REPOSITORY');

export interface ISalpyeoUserRepository {
  create(creator: SalpyeoUserCreator): Promise<SalpyeoUser>;
  findById(id: number): Promise<SalpyeoUser | null>;
  findOneOrThrowById(id: number): Promise<SalpyeoUser>;
  findBySnsId(snsType: SALPYEO_SNS_TYPE, snsId: string): Promise<SalpyeoUser | null>;
  /** 로그인할 때마다 구글 프로필(이름·이미지·이메일)의 변경을 반영한다 */
  updateProfile(userId: number, patch: { name: string; email: string | null; iconImageUrl: string | null }): Promise<SalpyeoUser>;
}
