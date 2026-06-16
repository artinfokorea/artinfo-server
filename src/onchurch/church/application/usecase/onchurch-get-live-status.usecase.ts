import { Inject, Injectable } from '@nestjs/common';
import { ONCHURCH_CHURCH_REPOSITORY, IOnchurchChurchRepository } from '@/onchurch/church/domain/repository/onchurch-church.repository.interface';

// 라이브를 켜둔 채 끄는 것을 깜빡해도, 시작 후 이 시간이 지나면 표시 단계에서 자동 종료 처리한다.
const LIVE_AUTO_OFF_MS = 3 * 60 * 60 * 1000;

export type OnchurchLiveStatus = { isLive: boolean; channelId: string | null };

@Injectable()
export class OnchurchGetLiveStatusUseCase {
  constructor(
    @Inject(ONCHURCH_CHURCH_REPOSITORY)
    private readonly churchRepository: IOnchurchChurchRepository,
  ) {}

  async execute(slug: string): Promise<OnchurchLiveStatus> {
    const church = await this.churchRepository.findPublishedBySlug(slug.trim());
    if (!church || !church.isLive || !church.liveStartedAt) {
      return { isLive: false, channelId: church?.liveChannelId ?? null };
    }
    const expired = Date.now() - church.liveStartedAt.getTime() >= LIVE_AUTO_OFF_MS;
    return { isLive: !expired, channelId: church.liveChannelId };
  }
}
