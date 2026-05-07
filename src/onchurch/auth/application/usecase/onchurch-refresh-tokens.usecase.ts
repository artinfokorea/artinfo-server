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

  async execute(accessToken: string, refreshToken: string): Promise<OnchurchAuth> {
    const decodedRefresh = await this.jwtService.verify(refreshToken, { secret: process.env['JWT_TOKEN_KEY'] });
    const { exp } = decodedRefresh;

    const decodedAccess = this.jwtService.decode(accessToken) as { id: number; loginId: string };
    const { id } = decodedAccess;

    const redisKey = `ONCHURCH:REFRESH=${id}`;
    const cachedAuth = await this.redisRepository.getByKey(redisKey);

    if (!cachedAuth) {
      const user = await this.userRepository.findOneOrThrowById(id);
      let auth: OnchurchAuth;

      const currentTime = Math.floor(Date.now() / 1000);
      const oneHourInSeconds = 3600;
      if (exp - currentTime < oneHourInSeconds) {
        auth = await this.authRepository.renewTokens(user, accessToken, refreshToken);
      } else {
        auth = await this.authRepository.renewAccessToken(user, accessToken, refreshToken);
      }

      await this.redisRepository.setValue({
        key: redisKey,
        value: auth,
        ttl: 3,
      });

      return auth;
    } else {
      return cachedAuth as OnchurchAuth;
    }
  }
}
