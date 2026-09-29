import { Inject, Injectable } from '@nestjs/common';
import { IOngiActivityRepository, ONGI_ACTIVITY_REPOSITORY } from '@/ongi/activity/domain/repository/ongi-activity.repository.interface';
import { normalizeAppVersion, normalizePingSeconds, normalizePlatform } from '@/ongi/activity/domain/service/ongi-activity-policy';

export interface OngiActivityPingInput {
  seconds?: number;
  newSession?: boolean;
  platform?: string;
  appVersion?: string;
}

@Injectable()
export class OngiRecordActivityPingUseCase {
  constructor(
    @Inject(ONGI_ACTIVITY_REPOSITORY)
    private readonly activityRepository: IOngiActivityRepository,
  ) {}

  async execute(userId: number, input: OngiActivityPingInput): Promise<void> {
    await this.activityRepository.addPing({
      userId,
      seconds: normalizePingSeconds(input.seconds),
      sessions: input.newSession === true ? 1 : 0,
      platform: normalizePlatform(input.platform),
      appVersion: normalizeAppVersion(input.appVersion),
    });
  }
}
