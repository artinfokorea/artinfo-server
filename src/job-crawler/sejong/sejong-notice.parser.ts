import * as cheerio from 'cheerio';

export interface SejongNoticeRow {
  /** 게시글 번호 (view.do?nttId=, 예: 50240) */
  id: string;
  title: string;
  /** 목록의 '날짜' 칸 YYYY-MM-DD (상세의 작성일과 하루 다를 수 있다 — 수정일로 보인다) */
  registeredAt: string;
  /** 번호 칸이 숫자가 아닌 상단 고정 글 (지금은 없지만 대비) */
  pinned: boolean;
  /** 상세 페이지 절대 URL (recruitSiteUrl · 중복 판정 키) */
  url: string;
}

export interface SejongAttachment {
  /** 사용자에게 보이는 파일명 (확장자 포함) */
  name: string;
  /** 소문자 확장자 (점 제외) */
  ext: string;
  /** 다운로드 절대 URL (/portal/cmmn/file/fileDown.do?atchFileId=&fileSn=&bbsId=) — 쿠키·Referer 없이 받을 수 있다 */
  url: string;
}

export interface SejongBodyImage {
  /** 파일명 (URL 마지막 조각, 디코드) */
  name: string;
  /** 절대 URL — 세종은 채용 사이트(career.co.kr · incruit) 이미지를 그대로 끼운다 */
  url: string;
}

export interface SejongNoticeDetail {
  title: string;
  /** 작성일 YYYY-MM-DD (작성일 칸 "2026-11-09 13:06" 의 날짜) */
  writtenAt: string;
  /** 본문 텍스트 — 표는 한 행을 ' | ' 로 이어 한 줄로 (전공 추출용) */
  bodyText: string;
  /** 본문을 표·문단 구조까지 살린 정리된 HTML (채용 상세 contents 용). 본문이 그림뿐이면 빈 문자열 */
  bodyHtml: string;
  images: SejongBodyImage[];
  attachments: SejongAttachment[];
}

export const SEJONG_ORIGIN = 'https://www.sejongpac.or.kr';
export const SEJONG_BOARD_ID = 'B0000065';
export const SEJONG_MENU_NO = '200571';
export const SEJONG_LIST_PATH = `/portal/bbs/${SEJONG_BOARD_ID}/list.do`;

export function sejongDetailUrl(id: string, origin = SEJONG_ORIGIN): string {
  return `${origin}/portal/bbs/${SEJONG_BOARD_ID}/view.do?nttId=${id}&menuNo=${SEJONG_MENU_NO}`;
}

const clean = (text: string) => text.replace(/ /g, ' ').replace(/\s+/g, ' ').trim();
const absolute = (origin: string, url: string) => (url.startsWith('http') ? url : `${origin}${url.startsWith('/') ? '' : '/'}${url}`);
const fileName = (url: string) => {
  const last = url.slice(url.lastIndexOf('/') + 1).split('?')[0];
  try {
    return decodeURIComponent(last);
  } catch {
    return last;
  }
};

/**
 * 세종문화회관 채용공고 목록 (#content table tbody tr: 번호 td.num · 제목 td.link a[href*=view.do?nttId=] · 날짜 td.line · 조회수).
 * 날짜 내림차순 10건씩, ?pageIndex=N (화면은 폼 submit 이지만 GET 으로 넘어간다).
 */
export function parseSejongNoticeList(html: string, origin = SEJONG_ORIGIN): SejongNoticeRow[] {
  const $ = cheerio.load(html);
  const rows: SejongNoticeRow[] = [];
  $('table tbody tr').each((_, tr) => {
    const link = $(tr).find('td.link a[href*="view.do"]').first();
    const href = link.attr('href') ?? '';
    const id = /[?&]nttId=(\d+)/.exec(href)?.[1];
    if (!id) return;
    const registeredAt = clean($(tr).find('td.line').first().text());
    if (!/^\d{4}-\d{2}-\d{2}$/.test(registeredAt)) return;
    const num = clean($(tr).find('td.num').first().text());
    rows.push({
      id,
      title: clean(link.text()),
      registeredAt,
      pinned: num.length > 0 && !/^\d+$/.test(num),
      url: sejongDetailUrl(id, origin),
    });
  });
  return rows;
}

/**
 * 상세 (div.view): 첫 div 에 제목 <p> · 작성일 · 첨부(ul.file_list a[href*=fileDown.do]), 둘째 div[tabindex] 가 본문.
 * 본문은 채용 사이트 템플릿(인라인 스타일 가득) 이라 텍스트만 뽑고, <img> 는 images 로 따로 낸다 (공고 전체가 그림 한 장인 글도 있다).
 */
export function parseSejongNoticeDetail(html: string, origin = SEJONG_ORIGIN): SejongNoticeDetail {
  const $ = cheerio.load(html);
  const view = $('div.view').first();
  const head = view.children('div').first();
  const body = view.children('div[tabindex]').first();

  const bodyHtml = sanitizeSejongBodyHtml($, body.clone());

  const images: SejongBodyImage[] = [];
  body.find('img').each((_, img) => {
    const src = $(img).attr('src');
    if (!src || src.startsWith('data:')) return;
    const url = absolute(origin, src);
    images.push({ name: fileName(url), url });
  });
  body.find('img, script, style, meta').remove();
  body.find('br').replaceWith('\n');
  body.find('tr').each((_, tr) => {
    const cells = $(tr)
      .find('th, td')
      .map((__, cell) => clean($(cell).text()))
      .get()
      .filter(c => c.length > 0);
    $(tr).replaceWith(`${cells.join(' | ')}\n`);
  });
  body.find('p, div, li, h1, h2, h3, h4, h5, h6, table').each((_, el) => {
    $(el).append('\n');
  });
  const bodyText = body
    .text()
    .replace(/ /g, ' ')
    .split('\n')
    .map(line => line.replace(/\s+/g, ' ').trim())
    .filter((line, i, arr) => line.length > 0 || (i > 0 && arr[i - 1].length > 0))
    .join('\n')
    .trim();

  const attachments: SejongAttachment[] = [];
  head.find('ul.file_list a[href*="fileDown.do"]').each((_, a) => {
    const href = $(a).attr('href');
    const name = clean($(a).text());
    if (!href || !name) return;
    const ext = name.includes('.') ? name.slice(name.lastIndexOf('.') + 1).toLowerCase() : '';
    attachments.push({ name, ext, url: absolute(origin, href) });
  });

  const written = head
    .find('li')
    .filter((_, li) => clean($(li).find('span').text()) === '작성일')
    .first();
  const writtenAt = /\d{4}-\d{2}-\d{2}/.exec(clean(written.text()))?.[0] ?? '';

  return {
    title: clean(head.find('p').first().text()),
    writtenAt,
    bodyText,
    bodyHtml,
    images,
    attachments,
  };
}

/** contents 에 남길 태그. 그 밖의 태그는 풀어서 자식만 남긴다 */
const KEPT_TAGS = new Set([
  'p',
  'br',
  'ul',
  'ol',
  'li',
  'strong',
  'b',
  'em',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'table',
  'thead',
  'tbody',
  'tfoot',
  'tr',
  'th',
  'td',
]);
/** 통째로 버릴 태그 */
const DROPPED_TAGS = new Set([
  'script',
  'style',
  'meta',
  'link',
  'img',
  'iframe',
  'object',
  'embed',
  'video',
  'audio',
  'svg',
  'colgroup',
  'col',
  'caption',
  'input',
  'button',
  'form',
]);
const KEPT_ATTRS = new Set(['rowspan', 'colspan']);

/**
 * 채용 사이트 템플릿 본문(인라인 스타일 가득한 div·span·table)을 웹·앱 에디터 뷰가 그릴 수 있는 HTML 로 줄인다.
 * - 문단·줄바꿈·목록·강조·제목·표(rowspan/colspan 유지)만 남기고 속성은 다 뗀다
 * - 표는 CKEditor 처럼 <figure class="table"> 로 감싼다 (웹 .ck-content .table 스타일이 테두리·전체 폭을 그린다)
 * - 글자 없는 문단·빈 표 칸의 nbsp 는 지운다. 글자가 하나도 없으면 빈 문자열
 */
export function sanitizeSejongBodyHtml($: cheerio.CheerioAPI, body: cheerio.Cheerio<any>): string {
  body.find(Array.from(DROPPED_TAGS).join(', ')).remove();
  // 안쪽부터 풀어야 중첩된 div/span 이 모두 사라진다
  const unwrap = body.find('*').get().reverse();
  for (const el of unwrap) {
    const node = $(el);
    const tag = (el as { tagName?: string }).tagName?.toLowerCase() ?? '';
    if (!KEPT_TAGS.has(tag)) {
      node.replaceWith(node.contents());
      continue;
    }
    for (const name of Object.keys((el as { attribs?: Record<string, string> }).attribs ?? {})) {
      if (!KEPT_ATTRS.has(name)) node.removeAttr(name);
    }
  }
  body.find('p, li, h1, h2, h3, h4, h5, h6').each((_, el) => {
    const node = $(el);
    if (
      node
        .text()
        .replace(/\u00a0/g, ' ')
        .trim() === '' &&
      node.find('br').length === 0
    )
      node.remove();
  });
  body.find('table').each((_, el) => {
    $(el).wrap('<figure class="table"></figure>');
  });
  if (
    body
      .text()
      .replace(/\u00a0/g, ' ')
      .trim() === ''
  )
    return '';
  return (body.html() ?? '')
    .replace(/&nbsp;/g, ' ')
    .replace(/>\s+</g, '><')
    .trim();
}

const compactName = (name: string) => name.replace(/\s+/g, '');
/** 서식·악보·직무기술서·가점표·평가기준은 공고문이 아니다 (세종은 공고문을 본문에 쓰고 이런 보조 자료만 붙인다) */
const isSupplement = (name: string) =>
  /서식|지원서|응시원서|원서|동의서|자기소개서|지정곡|과제곡|자유곡|악보|excerpt|직무기술서|가점|평가기준|세부사항/i.test(compactName(name));

/**
 * 공고문 첨부를 고른다: HWP/HWPX/PDF 중 이름에 '공고' 가 든 것 → 보조 자료가 아닌 문서. 보조 자료뿐이면 없음(본문 글·이미지가 공고문).
 */
export function pickSejongNoticeDocument(attachments: SejongAttachment[]): SejongAttachment | undefined {
  const docs = attachments.filter(a => ['hwpx', 'hwp', 'pdf'].includes(a.ext));
  return docs.find(a => compactName(a.name).includes('공고')) ?? docs.find(a => !isSupplement(a.name));
}

/** 공고문 첨부도 본문 이미지도 없을 때 페이지로 쓸 보조 문서 (세부사항·평가기준 등, 서식·악보 제외) */
export function pickSejongFallbackDocument(attachments: SejongAttachment[]): SejongAttachment | undefined {
  const docs = attachments.filter(a => ['hwpx', 'hwp', 'pdf'].includes(a.ext));
  return docs.find(a => !/서식|지원서|응시원서|원서|동의서|자기소개서|지정곡|과제곡|자유곡|악보|excerpt/i.test(compactName(a.name)));
}
