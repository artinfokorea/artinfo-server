import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IOnchurchUserRepository } from '@/onchurch/user/domain/repository/onchurch-user.repository.interface';
import { ONCHURCH_USER_ROLE, OnchurchUser } from '@/onchurch/user/domain/entity/onchurch-user.entity';
import { OnchurchUserNotFound } from '@/onchurch/user/domain/exception/onchurch-user.exception';

const WITHDRAWN_NAME = '탈퇴한 회원';

@Injectable()
export class OnchurchUserRepository implements IOnchurchUserRepository {
  constructor(
    @InjectRepository(OnchurchUser)
    private readonly userRepository: Repository<OnchurchUser>,
  ) {}

  async create(params: {
    loginId: string;
    password: string;
    name: string;
    phone: string;
    role: ONCHURCH_USER_ROLE;
    churchName: string | null;
    churchId: number | null;
    marketingConsent: boolean;
    freeTrialUntil: Date | null;
    referralSource: string | null;
    referralSourceEtc: string | null;
    mustChangePassword?: boolean;
  }): Promise<number> {
    const user = await this.userRepository.save({
      loginId: params.loginId,
      password: params.password,
      name: params.name,
      phone: params.phone,
      role: params.role,
      churchName: params.churchName,
      churchId: params.churchId,
      marketingConsent: params.marketingConsent,
      freeTrialUntil: params.freeTrialUntil,
      referralSource: params.referralSource,
      referralSourceEtc: params.referralSourceEtc,
      mustChangePassword: params.mustChangePassword ?? false,
    });

    return user.id;
  }

  async findOneOrThrowById(id: number): Promise<OnchurchUser> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) throw new OnchurchUserNotFound();

    return user;
  }

  async findByLoginId(loginId: string): Promise<OnchurchUser | null> {
    return this.userRepository.findOneBy({ loginId });
  }

  async findByPhone(phone: string): Promise<OnchurchUser[]> {
    return this.userRepository.find({
      where: { phone },
      order: { createdAt: 'ASC', id: 'ASC' },
    });
  }

  async existsByLoginId(loginId: string): Promise<boolean> {
    const user = await this.userRepository.findOneBy({ loginId });
    return !!user;
  }

  async saveEntity(user: OnchurchUser): Promise<void> {
    await this.userRepository.save(user);
  }

  async searchCandidates(keyword: string, limit: number): Promise<OnchurchUser[]> {
    return this.userRepository
      .createQueryBuilder('u')
      .where('u.role != :master', { master: ONCHURCH_USER_ROLE.MASTER })
      .andWhere('(u.name ILIKE :kw OR u.loginId ILIKE :kw OR u.phone ILIKE :kw)', { kw: `%${keyword}%` })
      .orderBy('u.createdAt', 'DESC')
      .limit(limit)
      .getMany();
  }

  async findMembersByChurchId(churchId: number): Promise<OnchurchUser[]> {
    return this.userRepository.find({
      where: { churchId },
      order: { createdAt: 'DESC', id: 'DESC' },
    });
  }

  async findMemberByChurchId(churchId: number, id: number): Promise<OnchurchUser | null> {
    return this.userRepository.findOneBy({ id, churchId });
  }

  async softDeleteById(id: number): Promise<void> {
    await this.userRepository.softDelete({ id });
  }

  async withdraw(id: number): Promise<void> {
    await this.userRepository.manager.transaction(async manager => {
      await manager.query(`DELETE FROM onchurch_auths WHERE user_id = $1`, [id]);
      await manager.query(`UPDATE onchurch_community_posts SET author_name = $2 WHERE author_id = $1`, [id, WITHDRAWN_NAME]);
      await manager.query(`UPDATE onchurch_community_comments SET author_name = $2 WHERE author_id = $1`, [id, WITHDRAWN_NAME]);
      // login_id 는 unique 라 값을 비워 같은 아이디로 다시 가입할 수 있게 한다. 비밀번호는 로그인할 수 없는 값으로 바꾼다.
      await manager.query(
        `UPDATE onchurch_users
            SET login_id = $2, name = $3, phone = '', password = '', church_id = NULL, church_name = NULL,
                marketing_consent = false, deleted_at = now(), updated_at = now()
          WHERE id = $1`,
        [id, `withdrawn-${id}-${Date.now()}`, WITHDRAWN_NAME],
      );
    });
  }
}
