// 라이브 영상 URL에서 유튜브 영상ID(11자)를 파싱한다.
// watch?v=, youtu.be/, /live/, /embed/, /shorts/ 형식 지원. 실패 시 null.
export function parseYouTubeVideoId(rawUrl: string | null): string | null {
  const url = rawUrl?.trim();
  if (!url) return null;
  const patterns = [
    /[?&]v=([\w-]{11})/,
    /youtu\.be\/([\w-]{11})/,
    /\/live\/([\w-]{11})/,
    /\/embed\/([\w-]{11})/,
    /\/shorts\/([\w-]{11})/,
  ];
  for (const re of patterns) {
    const m = url.match(re);
    if (m?.[1]) return m[1];
  }
  return null;
}
