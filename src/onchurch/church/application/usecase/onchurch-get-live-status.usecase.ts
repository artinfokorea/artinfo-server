import { Inject, Injectable } from '@nestjs/common';
import { ONCHURCH_CHURCH_REPOSITORY, IOnchurchChurchRepository } from '@/onchurch/church/domain/repository/onchurch-church.repository.interface';
import { parseYouTubeVideoId } from '@/onchurch/church/application/service/youtube-channel.resolver';

// 라이브를 켜둔 채 끄는 것을 깜빡해도, 시작 후 이 시간이 지나면 표시 단계에서 자동 종료 처리한다.
const LIVE_AUTO_OFF_MS = 2 * 60 * 60 * 1000;

export type OnchurchLiveStatus = { isLive: boolean; videoId: string | null };

@Injectable()
export class OnchurchGetLiveStatusUseCase {
  constructor(
    @Inject(ONCHURCH_CHURCH_REPOSITORY)
    private readonly churchRepository: IOnchurchChurchRepository,
  ) {}

  async execute(slug: string): Promise<OnchurchLiveStatus> {
    const church = await this.churchRepository.findPublishedBySlug(slug.trim());
    if (!church || !church.isLive || !church.liveStartedAt) return { isLive: false, videoId: null };
    const expired = Date.now() - church.liveStartedAt.getTime() >= LIVE_AUTO_OFF_MS;
    if (expired) {
      // 2시간 경과 → 상태를 실제 OFF로 변경(관리자 토글도 꺼진 것으로 반영).
      await this.churchRepository.turnOffLive(church.id);
      return { isLive: false, videoId: null };
    }
    return { isLive: true, videoId: parseYouTubeVideoId(church.liveUrl) };
  }
}
