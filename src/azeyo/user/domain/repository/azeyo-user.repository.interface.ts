import { AzeyoUser } from '@/azeyo/user/domain/entity/azeyo-user.entity';

export const AZEYO_USER_REPOSITORY = Symbol('AZEYO_USER_REPOSITORY');

export interface IAzeyoUserRepository {
  create(params: {
    nickname: string;
    marriageYear: number;
    children: string;
    email: string | null;
    snsType: string | null;
    snsId: string | null;
    iconImageUrl: string | null;
  }): Promise<number>;
  findOneOrThrowById(id: number): Promise<AzeyoUser>;
  findBySnsId(snsType: string, snsId: string): Promise<AzeyoUser | null>;
  findByEmail(email: string): Promise<AzeyoUser | null>;
  existsByNickname(nickname: string): Promise<boolean>;
  saveEntity(user: AzeyoUser): Promise<void>;
  findTopMonthlyUsers(count: number): Promise<AzeyoUser[]>;
}
