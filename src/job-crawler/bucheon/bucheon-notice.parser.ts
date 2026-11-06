import * as cheerio from 'cheerio';

/** 부천시립예술단 누리집의 두 게시판 — 공지사항(article) · 단원채용(recruit) */
export type BucheonBoard = 'article' | 'recruit';

export const BUCHEON_BOARDS: Record<BucheonBoard, { listPath: string; viewPath: string; idParam: string; dateCell: string }> = {
  /** 공지사항: 목록 list.do?pageIndex=N (GET), 상세 view.do?atcId= , 작성일은 td.date */
  article: { listPath: '/front/M0000025/article/list.do', viewPath: '/front/M0000025/article/view.do', idParam: 'atcId', dateCell: 'td.date' },
  /** 단원채용: 목록 list.do?pageIndex=N (GET), 상세는 fn_viewPage('RM…') 이지만 view.do?rcrtId= GET 으로도 열린다, 등록일은 td.date01 */
  recruit: { listPath: '/front/M0000061/recruit/list.do', viewPath: '/front/M0000061/recruit/view.do', idParam: 'rcrtId', dateCell: 'td.date01' },
};

export interface BucheonNoticeRow {
  board: BucheonBoard;
  /** 게시글 id (atcId 'AT026086' · rcrtId 'RM000035') */
  id: string;
  title: string;
  /** 등록일 YYYY-MM-DD */
  registeredAt: string;
  /** 상세 페이지 절대 URL (recruitSiteUrl · 중복 판정 키) */
  url: string;
}

export interface BucheonAttachment {
  /** 사용자에게 보이는 파일명 (확장자 포함, 크기 표시는 뗀다) */
  name: string;
  /** 소문자 확장자 (점 제외) */
  ext: string;
  /** 다운로드 절대 URL (/file/download.do?fileId=) — 상세 페이지를 Referer 로 보내야 받을 수 있다 */
  url: string;
}

export interface BucheonBodyImage {
  /** 파일명 (URL 마지막 조각) */
  name: string;
  url: string;
}

export interface BucheonNoticeDetail {
  title: string;
  /** 작성일 YYYY-MM-DD */
  registeredAt: string;
  /** 본문 텍스트 (줄바꿈은 \n). 단원채용 글은 접수기간·발표일자·채용문의 줄이 앞에 붙는다 */
  bodyText: string;
  /** 본문에 든 이미지 (공고문을 이미지로 올리는 경우) */
  images: BucheonBodyImage[];
  attachments: BucheonAttachment[];
}

export const BUCHEON_ORIGIN = 'https://www.bucheonphil.or.kr';

export function bucheonDetailUrl(board: BucheonBoard, id: string, origin = BUCHEON_ORIGIN): string {
  const { viewPath, idParam } = BUCHEON_BOARDS[board];
  return `${origin}${viewPath}?${idParam}=${id}`;
}

const clean = (text: string) => text.replace(/ /g, ' ').replace(/\s+/g, ' ').trim();

/** 목록 (table tbody tr: 번호 · 제목(a) · … · 날짜 · 조회). 공지사항은 href 의 atcId, 단원채용은 onclick fn_viewPage('RM…') 에서 id 를 읽는다 */
export function parseBucheonNoticeList(html: string, board: BucheonBoard, origin = BUCHEON_ORIGIN): BucheonNoticeRow[] {
  const $ = cheerio.load(html);
  const { idParam, dateCell } = BUCHEON_BOARDS[board];
  const idPattern = board === 'article' ? new RegExp(`[?&]${idParam}=([A-Za-z0-9]+)`) : /fn_viewPage\('([A-Za-z0-9]+)'\)/;
  const rows: BucheonNoticeRow[] = [];
  $('table tbody tr').each((_, tr) => {
    const link = $(tr).find('td.subject a').first();
    const id = idPattern.exec(board === 'article' ? (link.attr('href') ?? '') : (link.attr('onclick') ?? ''))?.[1];
    if (!id) return;
    const registeredAt = $(tr).find(dateCell).first().text().trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(registeredAt)) return;
    link.find('i').remove();
    rows.push({ board, id, title: clean(link.text()), registeredAt, url: bucheonDetailUrl(board, id, origin) });
  });
  return rows;
}

/**
 * 상세 (div.boardView): 제목 h4.tit · 작성일(.info li em '작성일' 옆 span) · 안내(.jobList li, 단원채용만) · 본문 .viewContent (<br> 은 줄바꿈, 이미지는 따로) ·
 * 첨부 .boardFile a[href*="download.do"] (텍스트 끝의 '(203.0KB)' 는 뗀다)
 */
export function parseBucheonNoticeDetail(html: string, origin = BUCHEON_ORIGIN): BucheonNoticeDetail {
  const $ = cheerio.load(html);
  const view = $('.boardView').first();
  const absolute = (url: string) => (url.startsWith('http') ? url : `${origin}${url.startsWith('/') ? '' : '/'}${url}`);

  const registeredAt = clean(
    view
      .find('.info li')
      .filter((_, li) => $(li).find('em').text().trim() === '작성일')
      .first()
      .find('span')
      .text(),
  );

  const infoLines = view
    .find('.jobList li')
    .map((_, li) => `${clean($(li).find('em').first().text())}: ${clean($(li).children().not('em').text())}`)
    .get()
    .filter(line => !line.endsWith(': '));

  const images: BucheonBodyImage[] = [];
  const body = view.find('.viewContent').first();
  body.find('img').each((_, img) => {
    const src = $(img).attr('src');
    if (!src) return;
    const url = absolute(src);
    images.push({ name: decodeURIComponent(url.slice(url.lastIndexOf('/') + 1).split('?')[0]), url });
  });
  body.find('img').remove();
  body.find('br').replaceWith('\n');
  body.find('p, div').each((_, el) => {
    $(el).append('\n');
  });
  const bodyLines = body
    .text()
    .replace(/ /g, ' ')
    .split('\n')
    .map(line => line.replace(/\s+/g, ' ').trim());
  const bodyText = [...infoLines, ...(infoLines.length && bodyLines.some(l => l) ? [''] : []), ...bodyLines]
    .filter((line, i, arr) => line.length > 0 || (i > 0 && arr[i - 1].length > 0))
    .join('\n')
    .trim();

  const attachments: BucheonAttachment[] = [];
  view.find('.boardFile a[href*="download.do"]').each((_, a) => {
    const href = $(a).attr('href');
    const name = clean($(a).text()).replace(/\s*\([\d.,]+\s*[KMG]?B\)\s*$/i, '');
    if (!href || !name) return;
    const ext = name.includes('.') ? name.slice(name.lastIndexOf('.') + 1).toLowerCase() : '';
    attachments.push({ name, ext, url: absolute(href) });
  });

  return { title: clean(view.find('.viewTit .tit').first().text()), registeredAt, bodyText, images, attachments };
}

const DOCUMENT_EXTS = ['hwpx', 'hwp', 'pdf'];
const compactName = (name: string) => name.replace(/\s+/g, '');
/** 서식·지원서·원서 · 지정곡/악보 는 공고문이 아니다 */
const isFormOrScore = (name: string) => /서식|지원서|응시원서|원서|지정곡|자유곡|악보/.test(compactName(name));

/**
 * 공고문 파일을 고른다 (첨부 목록과 ZIP 안 파일 목록 모두에 쓴다):
 * HWP/HWPX/PDF 중 서식·지정곡이 아닌 것만 후보로 두고, 이름에 '공고' 가 든 것 → 나머지 순서로, 같은 순위면 HWP/HWPX 를 PDF 보다 먼저.
 * 서식만 있으면 고르지 않는다 (본문 이미지로 대신하거나 건너뛴다).
 */
export function pickBucheonNoticeDocument<T extends { name: string; ext: string }>(files: T[]): T | undefined {
  const tier = (f: T) => (compactName(f.name).includes('공고') ? 0 : 1);
  const extRank = (f: T) => (f.ext === 'pdf' ? 1 : 0);
  return files.filter(f => DOCUMENT_EXTS.includes(f.ext) && !isFormOrScore(f.name)).sort((a, b) => tier(a) - tier(b) || extRank(a) - extRank(b))[0];
}

/** 공고문 묶음 ZIP 을 고른다: 이름에 '공고' 가 든 것 → 첫 ZIP */
export function pickBucheonNoticeZip<T extends { name: string; ext: string }>(files: T[]): T | undefined {
  const zips = files.filter(f => f.ext === 'zip');
  return zips.find(f => compactName(f.name).includes('공고')) ?? zips[0];
}

/** 경로의 마지막 조각과 소문자 확장자 */
export function fileNameAndExt(pathname: string): { name: string; ext: string } {
  const name = pathname.slice(pathname.lastIndexOf('/') + 1);
  return { name, ext: name.includes('.') ? name.slice(name.lastIndexOf('.') + 1).toLowerCase() : '' };
}
