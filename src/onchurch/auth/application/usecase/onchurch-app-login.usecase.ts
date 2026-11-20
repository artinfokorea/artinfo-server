import { Inject, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { ONCHURCH_USER_REPOSITORY, IOnchurchUserRepository } from '@/onchurch/user/domain/repository/onchurch-user.repository.interface';
import { ONCHURCH_AUTH_REPOSITORY, IOnchurchAuthRepository } from '@/onchurch/auth/domain/repository/onchurch-auth.repository.interface';
import { ONCHURCH_CHURCH_REPOSITORY, IOnchurchChurchRepository } from '@/onchurch/church/domain/repository/onchurch-church.repository.interface';
import { OnchurchAuth } from '@/onchurch/auth/domain/entity/onchurch-auth.entity';
import { OnchurchChurch } from '@/onchurch/church/domain/entity/onchurch-church.entity';
import { OnchurchInvalidCredentials, OnchurchNoChurch } from '@/onchurch/auth/domain/exception/onchurch-auth.exception';

// 앱 로그인 — 웹과 달리 교회(slug)를 묻지 않는다. 아이디·비밀번호만 받고,
// 그 계정의 교회(소유한 교회 → 없으면 소속 교회)를 토큰과 함께 돌려줘 앱이 그 교회로 바로 들어가게 한다.
@Injectable()
export class OnchurchAppLoginUseCase {
  constructor(
    @Inject(ONCHURCH_USER_REPOSITORY)
    private readonly userRepository: IOnchurchUserRepository,

    @Inject(ONCHURCH_AUTH_REPOSITORY)
    private readonly authRepository: IOnchurchAuthRepository,

    @Inject(ONCHURCH_CHURCH_REPOSITORY)
    private readonly churchRepository: IOnchurchChurchRepository,
  ) {}

  async execute(params: { userId: string; password: string }): Promise<{ auth: OnchurchAuth; church: OnchurchChurch }> {
    const user = await this.userRepository.findByLoginId(params.userId);
    if (!user) throw new OnchurchInvalidCredentials();

    const passwordMatches = await bcrypt.compare(params.password, user.password);
    if (!passwordMatches) throw new OnchurchInvalidCredentials();

    const church = (await this.churchRepository.findByOwnerId(user.id)) ?? (user.churchId ? await this.churchRepository.findById(user.churchId) : null);
    if (!church) throw new OnchurchNoChurch();

    const auth = await this.authRepository.create({ userId: user.id }, user);
    return { auth, church };
  }
}
