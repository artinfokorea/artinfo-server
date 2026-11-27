import { Injectable } from '@nestjs/common';

/** 유튜브 영상이 재생 가능한지 oEmbed 로 확인한다. 200 정상, 404 삭제, 401/403 비공개·퍼가기 금지. */
@Injectable()
export class YoutubeAvailability {
  async status(videoId: string): Promise<number> {
    const url = `https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(`https://www.youtube.com/watch?v=${videoId}`)}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(10_000) });
    return res.status;
  }
}
