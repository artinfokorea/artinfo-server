import { Inject, Injectable } from '@nestjs/common';
import { IOngiPushTokenRepository, ONGI_PUSH_TOKEN_REPOSITORY } from '@/ongi/push/domain/repository/ongi-push-token.repository.interface';
import { IOngiPushPreferenceRepository, ONGI_PUSH_PREFERENCE_REPOSITORY } from '@/ongi/push/domain/repository/ongi-push-preference.repository.interface';
import { DEFAULT_PUSH_PREFERENCES, mergePushPreferences, OngiPushPreferences } from '@/ongi/push/domain/service/ongi-push-preference';

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

@Injectable()
export class OngiGetPushPreferencesUseCase {
  constructor(
    @Inject(ONGI_PUSH_PREFERENCE_REPOSITORY)
    private readonly preferenceRepository: IOngiPushPreferenceRepository,
  ) {}

  async execute(userId: number): Promise<OngiPushPreferences> {
    return (await this.preferenceRepository.findByUserId(userId)) ?? DEFAULT_PUSH_PREFERENCES;
  }
}

@Injectable()
export class OngiUpdatePushPreferencesUseCase {
  constructor(
    @Inject(ONGI_PUSH_PREFERENCE_REPOSITORY)
    private readonly preferenceRepository: IOngiPushPreferenceRepository,
  ) {}

  /** 보낸 항목만 바꾸고 나머지는 유지. 저장한 적 없으면 기본값 위에 덮어쓴다 */
  async execute(userId: number, patch: Partial<OngiPushPreferences>): Promise<OngiPushPreferences> {
    const merged = mergePushPreferences(await this.preferenceRepository.findByUserId(userId), patch);
    await this.preferenceRepository.save(userId, merged);
    return merged;
  }
}
