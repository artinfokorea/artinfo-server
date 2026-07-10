import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ONCHURCH_USER_REPOSITORY, IOnchurchUserRepository } from '@/onchurch/user/domain/repository/onchurch-user.repository.interface';
import { ONCHURCH_AUTH_REPOSITORY, IOnchurchAuthRepository } from '@/onchurch/auth/domain/repository/onchurch-auth.repository.interface';
import { OnchurchAuth } from '@/onchurch/auth/domain/entity/onchurch-auth.entity';
import { RedisRepository } from '@/common/redis/redis-repository.service';

@Injectable()
export class OnchurchRefreshTokensUseCase {
  constructor(
    @Inject(ONCHURCH_USER_REPOSITORY)
    private readonly userRepository: IOnchurchUserRepository,

    @Inject(ONCHURCH_AUTH_REPOSITORY)
    private readonly authRepository: IOnchurchAuthRepository,

    private readonly redisRepository: RedisRepository,
    private readonly jwtService: JwtService,
  ) {}

  // 세션(refresh 토큰) 단위 결과 캐시/락 TTL.
  private readonly RESULT_TTL_SEC = 10;
  private readonly LOCK_TTL_MS = 5000;

  async execute(accessToken: string, refreshToken: string): Promise<OnchurchAuth> {
    const decodedRefresh = await this.jwtService.verify(refreshToken, { secret: process.env['JWT_TOKEN_KEY'] });
    const { exp } = decodedRefresh;

    const decodedAccess = this.jwtService.decode(accessToken) as { id: number; loginId: string };
    const { id } = decodedAccess;

    // refresh 토큰(=세션) 단위 키. userId 기준이던 기존 방식은 같은 유저의 다른 세션이 충돌했다.
    // 같은 세션의 동시 refresh를 하나로 합쳐, access 토큰 교체 레이스로 인한 재발급 실패(→로그아웃)를 막는다.
    const resultKey = `ONCHURCH:REFRESH_RESULT=${refreshToken}`;
    const lockKey = `ONCHURCH:REFRESH_LOCK=${refreshToken}`;

    // 이미 다른 동시 요청이 처리해 둔 결과가 있으면 그대로 재사용.
    const cached = await this.redisRepository.getByKey(resultKey);
    if (cached) return cached as OnchurchAuth;

    // 락 획득한 요청만 실제 재발급. 나머지는 승자의 결과가 캐시될 때까지 대기.
    const locked = await this.redisRepository.acquireLock(lockKey, this.LOCK_TTL_MS);
    if (!locked) {
      const awaited = await this.waitForCachedResult(resultKey);
      if (awaited) return awaited;
      // 대기 타임아웃(승자 지연/실패) → 아래로 폴백해 직접 재발급 시도.
    }

    try {
      // 락을 잡는 사이 캐시가 채워졌을 수 있으니 한 번 더 확인.
      const recheck = await this.redisRepository.getByKey(resultKey);
      if (recheck) return recheck as OnchurchAuth;

      const user = await this.userRepository.findOneOrThrowById(id);

      const currentTime = Math.floor(Date.now() / 1000);
      const oneHourInSeconds = 3600;
      const auth =
        exp - currentTime < oneHourInSeconds
          ? await this.authRepository.renewTokens(user, accessToken, refreshToken)
          : await this.authRepository.renewAccessToken(user, accessToken, refreshToken);

      // 결과를 캐시해 동일 세션의 다른 동시 요청(회전 시 옛 토큰 보유자 포함)이 재사용하도록 함.
      await this.redisRepository.setValue({ key: resultKey, value: auth, ttl: this.RESULT_TTL_SEC });

      return auth;
    } finally {
      if (locked) await this.redisRepository.delete(lockKey);
    }
  }

  // 승자가 결과를 캐시할 때까지 최대 ~3초 폴링 대기.
  private async waitForCachedResult(resultKey: string): Promise<OnchurchAuth | null> {
    for (let i = 0; i < 30; i++) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      const cached = await this.redisRepository.getByKey(resultKey);
      if (cached) return cached as OnchurchAuth;
    }
    return null;
  }
}
