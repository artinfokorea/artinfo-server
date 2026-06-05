import { Inject, Injectable } from '@nestjs/common';
import { ONCHURCH_USER_REPOSITORY, IOnchurchUserRepository } from '@/onchurch/user/domain/repository/onchurch-user.repository.interface';
import { ONCHURCH_CHURCH_REPOSITORY, IOnchurchChurchRepository } from '@/onchurch/church/domain/repository/onchurch-church.repository.interface';
import { ONCHURCH_USER_ROLE, OnchurchUser } from '@/onchurch/user/domain/entity/onchurch-user.entity';
import { OnchurchLoginIdNotFoundByPhone, OnchurchPhoneNotVerified } from '@/onchurch/auth/domain/exception/onchurch-auth.exception';
import { RedisRepository } from '@/common/redis/redis-repository.service';

export interface OnchurchFoundLoginId {
  loginId: string;
  name: string;
  createdAt: Date;
}

@Injectable()
export class OnchurchFindLoginIdsUseCase {
  constructor(
    @Inject(ONCHURCH_USER_REPOSITORY)
    private readonly userRepository: IOnchurchUserRepository,

    @Inject(ONCHURCH_CHURCH_REPOSITORY)
    private readonly churchRepository: IOnchurchChurchRepository,

    private readonly redisRepository: RedisRepository,
  ) {}

  async execute(phone: string, churchSlug?: string | null): Promise<OnchurchFoundLoginId[]> {
    // 휴대폰 인증(verifications/mobile)을 먼저 통과해야 한다.
    const verifiedKey = `onchurch:verified:${phone}`;
    const isPhoneVerified = await this.redisRepository.getByKey(verifiedKey);
    if (!isPhoneVerified) throw new OnchurchPhoneNotVerified();

    let users = await this.userRepository.findByPhone(phone);

    if (churchSlug) {
      // 교회 페이지에서 찾는 경우, 해당 교회 소속(성도)이거나 소유(관리자)한 계정만 노출한다.
      const church = await this.churchRepository.findBySlug(churchSlug);
      users = church ? users.filter((user) => user.churchId === church.id || church.ownerId === user.id) : [];
    } else {
      // 랜딩(관리 콘솔)에서 찾는 경우, 관리자(ADMIN) 계정만 노출한다.
      users = users.filter((user) => user.role === ONCHURCH_USER_ROLE.ADMIN);
    }

    // 인증 플래그는 1회성으로 소비한다.
    await this.redisRepository.delete(verifiedKey);

    if (users.length === 0) throw new OnchurchLoginIdNotFoundByPhone();

    // 연락처 중복이 있을 수 있으므로 (스코프 내) 모든 아이디를 반환한다.
    return users.map((user: OnchurchUser) => ({
      loginId: user.loginId,
      name: user.name,
      createdAt: user.createdAt,
    }));
  }
}
