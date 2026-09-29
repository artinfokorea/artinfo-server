import { Inject, Injectable, Logger } from '@nestjs/common';
import { IOngiActivityRepository, ONGI_ACTIVITY_REPOSITORY } from '@/ongi/activity/domain/repository/ongi-activity.repository.interface';
import { shouldTouchActivity } from '@/ongi/activity/domain/service/ongi-activity-policy';

/** 기억해 둘 사용자 수 상한 — 넘으면 비우고 다시 쌓는다 (비워도 기록이 한 번 더 쓰일 뿐이다) */
const MAX_REMEMBERED_USERS = 50000;

/**
 * 인증된 요청이 올 때마다 불리지만 DB 에는 사용자당 5분에 한 번만 쓴다.
 * 마지막 기록 시각은 서버 메모리에 둔다 — 서버가 여러 대면 대마다 따로 세지만, 기록은 멱등(upsert)이라 결과는 같다.
 */
@Injectable()
export class OngiActivityTracker {
  private readonly logger = new Logger(OngiActivityTracker.name);
  private readonly lastTouchedAt = new Map<number, Date>();

  constructor(
    @Inject(ONGI_ACTIVITY_REPOSITORY)
    private readonly activityRepository: IOngiActivityRepository,
  ) {}

  /** 통계 때문에 요청이 실패하면 안 되므로 예외를 밖으로 던지지 않는다 */
  async track(userId: number | undefined, accessToken: string, now: Date = new Date()): Promise<void> {
    if (!userId || !accessToken) return;
    if (!shouldTouchActivity(this.lastTouchedAt.get(userId) ?? null, now)) return;

    try {
      await this.activityRepository.touch(userId, accessToken);
      if (this.lastTouchedAt.size >= MAX_REMEMBERED_USERS) this.lastTouchedAt.clear();
      this.lastTouchedAt.set(userId, now);
    } catch (error) {
      this.logger.warn(`activity touch failed: ${(error as Error).message}`);
    }
  }
}
