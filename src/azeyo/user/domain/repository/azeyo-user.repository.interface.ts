import { AzeyoUser } from '@/azeyo/user/domain/entity/azeyo-user.entity';

export const AZEYO_USER_REPOSITORY = Symbol('AZEYO_USER_REPOSITORY');

export interface IAzeyoUserRepository {
  create(params: {
    name: string | null;
    nickname: string;
    marriageDate: string | null;
    children: string;
    gender: string | null;
    ageRange: string | null;
    birthDate: string | null;
    phone: string | null;
    email: string | null;
    snsType: string | null;
    snsId: string | null;
    iconImageUrl: string | null;
    marketingConsent: boolean;
  }): Promise<number>;
  findOneOrThrowById(id: number): Promise<AzeyoUser>;
  findBySnsId(snsType: string, snsId: string): Promise<AzeyoUser | null>;
  findByEmail(email: string): Promise<AzeyoUser | null>;
  existsByNickname(nickname: string): Promise<boolean>;
  findOneByNickname(nickname: string): Promise<AzeyoUser | null>;
  saveEntity(user: AzeyoUser): Promise<void>;
  findTopMonthlyUsers(count: number): Promise<AzeyoUser[]>;
}
