import { Inject, Injectable } from '@nestjs/common';
import { IOngiPushTokenRepository, ONGI_PUSH_TOKEN_REPOSITORY } from '@/ongi/push/domain/repository/ongi-push-token.repository.interface';

@Injectable()
export class OngiRegisterPushTokenUseCase {
  constructor(
    @Inject(ONGI_PUSH_TOKEN_REPOSITORY)
    private readonly pushTokenRepository: IOngiPushTokenRepository,
  ) {}

  async execute(userId: number, token: string, platform: string): Promise<void> {
    await this.pushTokenRepository.upsert(userId, token, platform);
  }
}

@Injectable()
export class OngiUnregisterPushTokenUseCase {
  constructor(
    @Inject(ONGI_PUSH_TOKEN_REPOSITORY)
    private readonly pushTokenRepository: IOngiPushTokenRepository,
  ) {}

  /** 로그아웃 — 이 기기 토큰만 지운다 (다른 기기는 유지) */
  async execute(token: string): Promise<void> {
    await this.pushTokenRepository.deleteByToken(token);
  }
}
