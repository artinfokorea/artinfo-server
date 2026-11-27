// 워드프레스 글(HTML)을 온교회 글로 옮길 때 쓰는 순수 변환 함수들.
// 온교회 공개 사이트는 글 본문을 평문으로 보여주므로 HTML 은 문단·줄바꿈만 살린 글자로 바꾼다.

const NAMED_ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
  lsquo: '‘',
  rsquo: '’',
  ldquo: '“',
  rdquo: '”',
  hellip: '…',
  ndash: '–',
  mdash: '—',
  middot: '·',
};

export function decodeEntities(text: string): string {
  return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (whole, code: string) => {
    if (code[0] === '#') {
      const n = code[1] === 'x' || code[1] === 'X' ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10);
      return Number.isFinite(n) ? String.fromCodePoint(n) : whole;
    }
    return NAMED_ENTITIES[code.toLowerCase()] ?? whole;
  });
}

export function htmlToText(html: string): string {
  let s = html
    .replace(/<(script|style|iframe|noscript)[\s\S]*?<\/\1>/gi, '')
    .replace(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi, (_w, href: string, inner: string) => {
      const label = decodeEntities(inner.replace(/<[^>]+>/g, '')).trim();
      const url = decodeEntities(href).trim();
      if (!label) return url;
      return label === url ? url : `${label} (${url})`;
    })
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|h[1-6]|li|blockquote|figure|section|article|tr)>/gi, '\n\n')
    .replace(/<li\b[^>]*>/gi, '• ')
    .replace(/<[^>]+>/g, '');
  s = decodeEntities(s).replace(/ /g, ' ');
  return s
    .split('\n')
    .map(line => line.replace(/[ \t]+/g, ' ').trim())
    .filter(line => line !== '•')
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function extractYoutubeUrl(html: string): string | null {
  const m = html.match(/(?:youtube(?:-nocookie)?\.com\/(?:embed\/|watch\?v=|shorts\/)|youtu\.be\/)([\w-]{11})/);
  return m ? `https://www.youtube.com/watch?v=${m[1]}` : null;
}

/** 워드프레스가 만든 축소본(-300x200.jpg)을 원본 주소로. 쿼리는 뗀다. */
export function toOriginalImageUrl(url: string): string {
  return url.split('?')[0].replace(/-\d+x\d+(\.[a-z0-9]+)$/i, '$1');
}

export function extractImageUrls(html: string): string[] {
  const out: string[] = [];
  for (const m of html.matchAll(/<img\b[^>]*?\ssrc=["']([^"']+)["']/gi)) {
    const src = decodeEntities(m[1]);
    if (!/^https?:\/\//i.test(src)) continue;
    const url = toOriginalImageUrl(src);
    if (!out.includes(url)) out.push(url);
  }
  return out;
}

const pad = (n: number) => String(n).padStart(2, '0');

/** 설교 날짜: 제목의 "(YYYY년) M월 D일". 해가 없으면 글 쓴 해(글 쓴 달보다 뒤 달이면 지난해). 없으면 글 쓴 날. */
export function sermonDateFromTitle(title: string, postDate: string): string {
  const posted = postDate.slice(0, 10);
  const m = title.match(/(?:(\d{4})\s*년\s*)?(\d{1,2})\s*월\s*(\d{1,2})\s*일/);
  if (!m) return posted;
  const month = Number(m[2]);
  const day = Number(m[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return posted;
  let year = m[1] ? Number(m[1]) : Number(posted.slice(0, 4));
  if (!m[1] && month > Number(posted.slice(5, 7))) year -= 1;
  return `${year}-${pad(month)}-${pad(day)}`;
}
