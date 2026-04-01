import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AZEYO_USER_REPOSITORY, IAzeyoUserRepository } from '@/azeyo/user/domain/repository/azeyo-user.repository.interface';
import { AZEYO_AUTH_REPOSITORY, IAzeyoAuthRepository } from '@/azeyo/auth/domain/repository/azeyo-auth.repository.interface';
import { AzeyoAuth } from '@/azeyo/auth/domain/entity/azeyo-auth.entity';
import { RedisRepository } from '@/common/redis/redis-repository.service';

@Injectable()
export class AzeyoRefreshTokensUseCase {
  constructor(
    @Inject(AZEYO_USER_REPOSITORY)
    private readonly userRepository: IAzeyoUserRepository,

    @Inject(AZEYO_AUTH_REPOSITORY)
    private readonly authRepository: IAzeyoAuthRepository,

    private readonly redisRepository: RedisRepository,
    private readonly jwtService: JwtService,
  ) {}

  async execute(accessToken: string, refreshToken: string): Promise<AzeyoAuth> {
    const decodedToken = await this.jwtService.verify(refreshToken, { secret: process.env['JWT_TOKEN_KEY'] });
    const { id, exp } = decodedToken;

    const redisKey = `AZEYO:REFRESH=${id}`;
    const cachedAuth = await this.redisRepository.getByKey(redisKey);

    if (!cachedAuth) {
      const user = await this.userRepository.findOneOrThrowById(id);
      let auth: AzeyoAuth;

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
      return cachedAuth as AzeyoAuth;
    }
  }
}
