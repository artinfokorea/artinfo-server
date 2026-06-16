import { Inject, Injectable } from '@nestjs/common';
import { ONCHURCH_CHURCH_REPOSITORY, IOnchurchChurchRepository } from '@/onchurch/church/domain/repository/onchurch-church.repository.interface';
import { resolveLiveVideoId } from '@/onchurch/church/application/service/youtube-channel.resolver';

// 라이브를 켜둔 채 끄는 것을 깜빡해도, 시작 후 이 시간이 지나면 표시 단계에서 자동 종료 처리한다.
const LIVE_AUTO_OFF_MS = 3 * 60 * 60 * 1000;
// 라이브 영상ID 스크랩 결과 캐시 TTL (폴링이 잦아도 유튜브를 자주 긁지 않도록).
const VIDEO_CACHE_MS = 45 * 1000;

export type OnchurchLiveStatus = { isLive: boolean; channelId: string | null; videoId: string | null };

@Injectable()
export class OnchurchGetLiveStatusUseCase {
  private readonly videoCache = new Map<string, { videoId: string | null; at: number }>();

  constructor(
    @Inject(ONCHURCH_CHURCH_REPOSITORY)
    private readonly churchRepository: IOnchurchChurchRepository,
  ) {}

  async execute(slug: string): Promise<OnchurchLiveStatus> {
    const church = await this.churchRepository.findPublishedBySlug(slug.trim());
    const channelId = church?.liveChannelId ?? null;
    if (!church || !church.isLive || !church.liveStartedAt) {
      return { isLive: false, channelId, videoId: null };
    }
    const expired = Date.now() - church.liveStartedAt.getTime() >= LIVE_AUTO_OFF_MS;
    if (expired) return { isLive: false, channelId, videoId: null };

    const videoId = await this.resolveVideoIdCached(slug, church.youtubeUrl, channelId);
    return { isLive: true, channelId, videoId };
  }

  private async resolveVideoIdCached(slug: string, youtubeUrl: string | null, channelId: string | null): Promise<string | null> {
    const cached = this.videoCache.get(slug);
    if (cached && Date.now() - cached.at < VIDEO_CACHE_MS) return cached.videoId;
    const videoId = await resolveLiveVideoId(youtubeUrl, channelId);
    this.videoCache.set(slug, { videoId, at: Date.now() });
    return videoId;
  }
}
