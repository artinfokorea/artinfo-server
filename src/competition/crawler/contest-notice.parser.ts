import * as cheerio from 'cheerio';

/** contest.co.kr 음악경연 목록 한 행 */
export interface ContestListRow {
  id: string;
  url: string;
  title: string;
  host: string;
  /** 목록의 지역 배지 (서울·경기·전국 …) */
  area: string;
  /** 분류 배지 (클래식/실용 · 음악경연대회 · 성악 …) */
  categories: string[];
  /** 접수중 · 접수예정 · 심사대기 · 심사중 · 마감 */
  state: string;
}

export interface ContestDetail {
  title: string;
  /** 대회일 YYYY-MM-DD (대회기간의 첫 날짜) */
  heldAt: string | null;
  openAt: string | null;
  closeAt: string | null;
  area: string | null;
  venue: string | null;
  organizer: string | null;
  tel: string | null;
  email: string | null;
  posterUrl: string | null;
  /** '관리자 알림' — 접수 방법 안내 */
  notice: string | null;
  /** '홈페이지' 링크 — 주최 사이트 (있으면 접수 링크로 쓴다) */
  homepage: string | null;
  /** '유의사항' */
  caution: string | null;
  /** 본문(.contents_view1) 텍스트 — 줄바꿈 유지 */
  bodyText: string;
  /** 본문 이미지 — 공고문·요강를 그림으로 올린 경우 여러 장 */
  bodyImages: string[];
}

export const CONTEST_ORIGIN = 'https://contest.co.kr';
/** 음악경연 전체 목록 — 50건/페이지 (접수예정·접수중·심사대기·심사중), 페이지는 pg=N */
export const CONTEST_LIST_PAGE_SIZE = 50;
export const contestListUrl = (page = 1) => `${CONTEST_ORIGIN}/contest/list_n/1?t=2&limit_=&pg=${page}`;
export const contestDetailUrl = (id: string) => `${CONTEST_ORIGIN}/contest/view1/${id}`;

const clean = (text: string) => text.replace(/ /g, ' ').replace(/\s+/g, ' ').trim();
/** 2026.11.01 · 26.11.01 → 2026-11-01 */
export const toIsoDate = (text: string | null | undefined): string | null => {
  const m = /(\d{2,4})\.(\d{1,2})\.(\d{1,2})/.exec(text ?? '');
  if (!m) return null;
  const year = m[1].length === 2 ? `20${m[1]}` : m[1];
  return `${year}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}`;
};

export function parseContestList(html: string): ContestListRow[] {
  const $ = cheerio.load(html);
  const rows: ContestListRow[] = [];
  $('table.boardlisttable tbody tr').each((_, tr) => {
    const id = /view1\/(\d+)/.exec($(tr).attr('onclick') ?? '')?.[1];
    if (!id) return;
    const badges = $(tr)
      .find('td.subject p.category span')
      .map((__, span) => clean($(span).text()))
      .get()
      .filter(Boolean);
    const area = badges.find(b => !$(tr).find(`td.subject p.category span.bigcate:contains("${b}")`).length) ?? '';
    rows.push({
      id,
      url: contestDetailUrl(id),
      title: clean($(tr).find('td.subject .main_contitle').text()),
      host: clean($(tr).find('td.boardinfo').text()),
      area,
      categories: badges.filter(b => b !== area && b !== '추천' && b !== '인기'),
      state: clean($(tr).find('td.stat .state1 span, td.stat span span').first().text()) || clean($(tr).find('td.stat').text().split(/\s/)[0]),
    });
  });
  return rows;
}

export function parseContestDetail(html: string): ContestDetail {
  const $ = cheerio.load(html);
  const field = (label: string) =>
    clean(
      $('.Competition_right dl')
        .filter((_, dl) => clean($(dl).find('dt').text()) === label)
        .first()
        .find('dd')
        .text(),
    ) || null;
  const period = field('접수기간');
  const [openText, closeText] = (period ?? '').split('~');
  const posterSrc = $('.listimg img').first().attr('src') ?? null;
  const absolute = (url: string) => (url.startsWith('http') ? url : `${CONTEST_ORIGIN}${url.startsWith('/') ? '' : '/'}${url}`);
  const homepageHref = $('.Competition_right dl')
    .filter((_, dl) => clean($(dl).find('dt').text()) === '홈페이지')
    .first()
    .find('a[href]')
    .attr('href');

  const body = $('.contents_view1').first();
  body.find('script, style').remove();
  const bodyImages = body
    .find('img[src]')
    .map((_, img) => absolute($(img).attr('src') as string))
    .get()
    .filter(src => !/n_icon\d*\.gif$/.test(src));
  body.find('img').remove();
  body.find('br').replaceWith('\n');
  body.find('p, div, li, tr, h1, h2, h3, h4').each((_, el) => {
    $(el).append('\n');
  });
  const bodyText = body
    .text()
    .replace(/\u00a0/g, ' ')
    .split('\n')
    .map(line => line.replace(/\s+/g, ' ').trim())
    .filter((line, i, arr) => line.length > 0 || (i > 0 && arr[i - 1].length > 0))
    .join('\n')
    .trim();

  return {
    title: clean($('.sub2_top_title').first().text()),
    heldAt: toIsoDate(field('대회기간')),
    openAt: toIsoDate(openText),
    closeAt: toIsoDate(closeText),
    area: field('지역')?.replace(/[[\]]/g, '') ?? null,
    venue: field('대회장소'),
    organizer: field('주관'),
    tel: field('전화'),
    email: field('이메일'),
    posterUrl: posterSrc ? (posterSrc.startsWith('http') ? posterSrc : `${CONTEST_ORIGIN}${posterSrc}`) : null,
    notice: field('관리자 알림'),
    homepage: homepageHref && /^https?:\/\//.test(homepageHref) ? homepageHref : null,
    caution: field('유의사항'),
    bodyText,
    bodyImages,
  };
}

/** 콩쿠르·경연대회만 — 입시 평가회·마스터클래스·모의평가·신입생 모집·합격자 발표는 뺀다 */
export function isCompetitionTitle(title: string): boolean {
  const compact = title.replace(/\s+/g, '');
  if (/평가회|평가|마스터클래스|클래스|신입생|입학|합격자|수상자|입상자|결과발표|신청서/i.test(compact)) return false;
  return /콩쿠르|콩쿨|경연|competition|concours|콘테스트|오디션|예술제|페스티벌|대회/i.test(compact);
}

const DIVISION_RULES: [string, RegExp][] = [
  ['피아노', /피아노|piano/i],
  ['성악', /성악|합창|가창|vocal|voice|choir/i],
  ['현악', /현악|바이올린|비올라|첼로|콘트라베이스|더블베이스|하프|기타|violin|viola|cello|strings?/i],
  ['관악', /관악|플루트|클라리넷|오보에|바순|트럼펫|호른|트롬본|튜바|색소폰|flute|clarinet|oboe|bassoon|trumpet|horn|trombone|saxophone|wind/i],
  ['작곡', /작곡|compos/i],
  ['실용음악', /실용|보컬|밴드|재즈|k-?pop|랩|힙합|댄스|동요/i],
];

/** 제목·분류 배지에서 부문을 찾는다. 하나도 없으면 종합 */
export function inferDivisions(title: string, categories: string[] = []): string[] {
  // '클래식/실용'·'음악경연대회' 같은 포괄 분류는 부문 단서가 아니다 ('실용' 이 실용음악으로 잡히지 않게)
  const hints = categories.filter(c => !/클래식\/실용|음악경연대회/.test(c));
  const text = `${title} ${hints.join(' ')}`;
  const found = DIVISION_RULES.filter(([, re]) => re.test(text)).map(([name]) => name);
  return found.length ? found : ['종합'];
}

/** 제목에서 참가 대상을 찾는다. 없으면 빈 배열(전연령) */
export function inferAges(title: string): string[] {
  const ages = new Set<string>();
  if (/초등|초등부|어린이|유소년/.test(title)) ages.add('초등');
  if (/중등|중학/.test(title)) ages.add('중등');
  if (/고등|고교|입시생/.test(title)) ages.add('고등');
  if (/대학|일반|성인|아마추어/.test(title)) ages.add('대학·일반');
  if (/청소년|영재|주니어|junior|young/i.test(title)) ['초등', '중등', '고등'].forEach(a => ages.add(a));
  return [...ages];
}
