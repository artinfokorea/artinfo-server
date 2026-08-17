import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { IOngiUserRepository, ONGI_USER_REPOSITORY } from '@/ongi/user/domain/repository/ongi-user.repository.interface';
import { IOngiAuthRepository, ONGI_AUTH_REPOSITORY } from '@/ongi/auth/domain/repository/ongi-auth.repository.interface';
import { OngiAuth } from '@/ongi/auth/domain/entity/ongi-auth.entity';
import { RedisRepository } from '@/common/redis/redis-repository.service';

@Injectable()
export class OngiRefreshTokensUseCase {
  constructor(
    @Inject(ONGI_USER_REPOSITORY)
    private readonly userRepository: IOngiUserRepository,

    @Inject(ONGI_AUTH_REPOSITORY)
    private readonly authRepository: IOngiAuthRepository,

    private readonly redisRepository: RedisRepository,
    private readonly jwtService: JwtService,
  ) {}

  async execute(accessToken: string, refreshToken: string): Promise<OngiAuth> {
    const decodedRefresh = await this.jwtService.verify(refreshToken, { secret: process.env['JWT_TOKEN_KEY'] });
    const { exp } = decodedRefresh;

    const decodedAccess = this.jwtService.decode(accessToken) as { id: number; name: string };
    const { id } = decodedAccess;

    const redisKey = `ONGI:REFRESH=${id}`;
    const cachedAuth = await this.redisRepository.getByKey(redisKey);
    if (cachedAuth) return cachedAuth as OngiAuth;

    const user = await this.userRepository.findOneOrThrowById(id);
    let auth: OngiAuth;

    const currentTime = Math.floor(Date.now() / 1000);
    const oneHourInSeconds = 3600;
    if (exp - currentTime < oneHourInSeconds) {
      auth = await this.authRepository.renewTokens(user, accessToken, refreshToken);
    } else {
      auth = await this.authRepository.renewAccessToken(user, accessToken, refreshToken);
    }

    await this.redisRepository.setValue({ key: redisKey, value: auth, ttl: 3 });

    return auth;
  }
}
