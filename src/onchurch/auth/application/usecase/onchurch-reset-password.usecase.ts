import { Inject, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { ONCHURCH_USER_REPOSITORY, IOnchurchUserRepository } from '@/onchurch/user/domain/repository/onchurch-user.repository.interface';
import { ONCHURCH_CHURCH_REPOSITORY, IOnchurchChurchRepository } from '@/onchurch/church/domain/repository/onchurch-church.repository.interface';
import { ONCHURCH_USER_ROLE } from '@/onchurch/user/domain/entity/onchurch-user.entity';
import { OnchurchAccountNotMatched, OnchurchPhoneNotVerified } from '@/onchurch/auth/domain/exception/onchurch-auth.exception';
import { RedisRepository } from '@/common/redis/redis-repository.service';

@Injectable()
export class OnchurchResetPasswordUseCase {
  private readonly BCRYPT_ROUNDS = 10;

  constructor(
    @Inject(ONCHURCH_USER_REPOSITORY)
    private readonly userRepository: IOnchurchUserRepository,

    @Inject(ONCHURCH_CHURCH_REPOSITORY)
    private readonly churchRepository: IOnchurchChurchRepository,

    private readonly redisRepository: RedisRepository,
  ) {}

  async execute(params: { loginId: string; phone: string; newPassword: string; churchSlug?: string | null }): Promise<void> {
    // 아이디 + 연락처로 휴대폰 인증(verifications/mobile)을 통과해야 한다.
    const verifiedKey = `onchurch:verified:${params.phone}`;
    const isPhoneVerified = await this.redisRepository.getByKey(verifiedKey);
    if (!isPhoneVerified) throw new OnchurchPhoneNotVerified();

    const user = await this.userRepository.findByLoginId(params.loginId);
    if (!user || user.phone !== params.phone) {
      throw new OnchurchAccountNotMatched();
    }

    if (params.churchSlug) {
      // 교회 페이지에서 재설정하는 경우, 해당 교회 소속(성도)이거나 소유(관리자)한 계정만 허용한다.
      const church = await this.churchRepository.findBySlug(params.churchSlug);
      const belongs = !!church && (user.churchId === church.id || church.ownerId === user.id);
      if (!belongs) throw new OnchurchAccountNotMatched();
    } else {
      // 랜딩(관리 콘솔)에서 재설정하는 경우, 오너/관리자 계정만 허용한다.
      if (user.role !== ONCHURCH_USER_ROLE.OWNER && user.role !== ONCHURCH_USER_ROLE.ADMIN) throw new OnchurchAccountNotMatched();
    }

    user.password = await bcrypt.hash(params.newPassword, this.BCRYPT_ROUNDS);
    await this.userRepository.saveEntity(user);

    // 인증 플래그는 1회성으로 소비한다.
    await this.redisRepository.delete(verifiedKey);
  }
}
