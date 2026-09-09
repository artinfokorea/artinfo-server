/** 커버 후보 한 줄 — ongi_photos 에서 최신순으로 읽어 온 값 */
export interface OngiAlbumCoverCandidate {
  url: string;
  thumb_url: string | null;
  media_type: string | null;
}

/**
 * 앨범 커버 URL 을 고른다 — 최신순 후보 중 "이미지로 그릴 수 있는" 첫 항목.
 *
 * 영상은 url 이 mp4 라 <img> 로 그릴 수 없다. 포스터(thumb_url)가 있으면 그것을 쓰고,
 * 포스터 추출이 실패해 포스터가 없는 영상이면 커버로 삼지 않고 다음 항목으로 내려간다.
 */
export function pickAlbumCoverUrl(candidates: OngiAlbumCoverCandidate[]): string | null {
  for (const candidate of candidates) {
    if (candidate.media_type === 'video') {
      if (candidate.thumb_url) return candidate.thumb_url;
      continue;
    }

    return candidate.thumb_url ?? candidate.url;
  }

  return null;
}
