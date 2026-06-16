// 유튜브 채널 URL에서 임베드용 채널ID(UC...)를 해석한다. YouTube Data API 키 없이 동작:
// 1) URL 문자열에서 직접 추출 (/channel/UC..., embed/live_stream?channel=UC...)
// 2) 핸들(@handle)/커스텀(/c, /user) URL은 채널 페이지 HTML을 1회 받아 channelId를 스크랩 (best-effort)
// 해석 실패 시 null. (null이면 프론트는 임베드 대신 유튜브 링크로 폴백)

const UC_RE = /(UC[\w-]{20,})/;

export function extractChannelIdFromUrl(url: string): string | null {
  const fromChannelPath = url.match(/\/channel\/(UC[\w-]{20,})/);
  if (fromChannelPath?.[1]) return fromChannelPath[1];
  const fromEmbed = url.match(/[?&]channel=(UC[\w-]{20,})/);
  if (fromEmbed?.[1]) return fromEmbed[1];
  return null;
}

// youtubeUrl(채널/핸들) + 채널ID로부터 "/live" 페이지 URL을 만든다.
function buildLivePageUrl(youtubeUrl: string | null, channelId: string | null): string | null {
  const cid = channelId?.trim();
  if (cid) return `https://www.youtube.com/channel/${encodeURIComponent(cid)}/live`;
  const url = youtubeUrl?.trim();
  if (!url) return null;
  const base = url.split('?')[0].replace(/\/+$/, '');
  if (/\/live$/.test(base)) return base;
  return `${base}/live`;
}

// 채널/핸들의 현재 라이브 영상ID(watch?v=...)를 "/live" 페이지에서 스크랩한다.
// live_stream?channel= 임베드가 불안정해, 실제 영상ID로 임베드하기 위함. 라이브가 아니면 null.
export async function resolveLiveVideoId(youtubeUrl: string | null, channelId: string | null): Promise<string | null> {
  const liveUrl = buildLivePageUrl(youtubeUrl, channelId);
  if (!liveUrl) return null;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(liveUrl, {
      headers: { 'accept-language': 'en-US,en;q=0.9', 'user-agent': 'Mozilla/5.0 (compatible; OnchurchBot/1.0)' },
      signal: controller.signal,
    }).finally(() => clearTimeout(timer));
    if (!res.ok) return null;
    const html = await res.text();
    // 라이브 중이면 canonical이 현재 라이브 영상을 가리킨다.
    const canonical = html.match(/<link rel="canonical" href="https:\/\/www\.youtube\.com\/watch\?v=([\w-]{11})">/);
    if (canonical?.[1]) return canonical[1];
    // 보조: 라이브 방송 플래그가 있을 때만 videoId 채택 (오프라인 페이지 오인 방지)
    if (/"isLiveBroadcast"\s*:\s*true|"isLiveNow"\s*:\s*true|"liveBroadcastDetails"/.test(html)) {
      return html.match(/"videoId":"([\w-]{11})"/)?.[1] ?? null;
    }
    return null;
  } catch {
    return null;
  }
}

export async function resolveYoutubeChannelId(rawUrl: string | null): Promise<string | null> {
  const url = rawUrl?.trim();
  if (!url) return null;

  const direct = extractChannelIdFromUrl(url);
  if (direct) return direct;

  // 핸들/커스텀 URL: 채널 페이지를 받아 channelId 스크랩 (실패해도 무방)
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(url, {
      headers: { 'accept-language': 'en-US,en;q=0.9', 'user-agent': 'Mozilla/5.0 (compatible; OnchurchBot/1.0)' },
      signal: controller.signal,
    }).finally(() => clearTimeout(timer));
    if (!res.ok) return null;
    const html = await res.text();
    const m =
      html.match(/"(?:channelId|externalId)":"(UC[\w-]{20,})"/) ||
      html.match(/\/channel\/(UC[\w-]{20,})/) ||
      html.match(UC_RE);
    return m?.[1] ?? null;
  } catch {
    return null;
  }
}
