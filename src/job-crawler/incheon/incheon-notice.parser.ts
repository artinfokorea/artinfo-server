import * as cheerio from 'cheerio';

export interface IncheonNoticeRow {
  /** 게시글 번호 (상세 URL 의 마지막 조각, 예: 3094311) */
  id: string;
  title: string;
  department: string;
  /** 작성일 YYYY-MM-DD */
  registeredAt: string;
  /** 상단 고정 공지 여부 — 1페이지에만 나오고 작성일 순서와 무관 (새 모집 공고는 보통 고정 공지로 올라온다) */
  pinned: boolean;
  /** 상세 페이지 절대 URL (recruitSiteUrl · 중복 판정 키) */
  url: string;
}

export interface IncheonAttachment {
  /** 사용자에게 보이는 파일명 (확장자 포함) */
  name: string;
  /** 소문자 확장자 (점 제외) */
  ext: string;
  /** 다운로드 절대 URL (/comm/getFile?srvcId=&upperNo=&fileTy=ATTACH&fileNo=) — 쿠키·Referer 없이 받을 수 있다 */
  url: string;
}

export interface IncheonNoticeDetail {
  title: string;
  department: string;
  /** 작성일 YYYY-MM-DD */
  registeredAt: string;
  /** 본문 텍스트 (줄바꿈은 \n) */
  bodyText: string;
  attachments: IncheonAttachment[];
}

export const INCHEON_ORIGIN = 'https://www.incheon.go.kr';
export const INCHEON_BOARD_PATH = '/art/ART040102';

export function incheonDetailUrl(id: string, origin = INCHEON_ORIGIN, boardPath = INCHEON_BOARD_PATH): string {
  return `${origin}${boardPath}/${id}`;
}

const clean = (text: string) => text.replace(/ /g, ' ').replace(/\s+/g, ' ').trim();

/**
 * 채용/공모 목록 (table#datatable-default tbody tr: 번호(또는 '공지') · 제목(a href="/art/ART040102/{id}") · 담당부서 · 작성일 · 조회수 · 첨부).
 * 고정 공지 행은 tr.notice 이고 제목 안의 '공지' 배지는 뗀다.
 */
export function parseIncheonNoticeList(html: string, origin = INCHEON_ORIGIN, boardPath = INCHEON_BOARD_PATH): IncheonNoticeRow[] {
  const $ = cheerio.load(html);
  const rows: IncheonNoticeRow[] = [];
  $('table#datatable-default tbody tr').each((_, tr) => {
    const tds = $(tr).find('td');
    const link = tds.eq(1).find('a').first();
    const id = /\/(\d+)\s*$/.exec(link.attr('href') ?? '')?.[1];
    if (!id) return;
    const registeredAt = tds.eq(3).text().trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(registeredAt)) return;
    link.find('span.state').remove();
    rows.push({
      id,
      title: clean(link.text()),
      department: clean(tds.eq(2).text()),
      registeredAt,
      pinned: $(tr).hasClass('notice') || tds.eq(0).text().includes('공지'),
      url: incheonDetailUrl(id, origin, boardPath),
    });
  });
  return rows;
}

/**
 * 상세 (div.board-view): 제목 h4.board-view-title · 메타 dl(dt 담당부서/작성일) · 본문 .board-view-contents (<br>·p 는 줄바꿈) ·
 * 첨부 .file-preview-down-group (span.file-name 이 파일명, a[href*="/comm/getFile"] 가 다운로드)
 */
export function parseIncheonNoticeDetail(html: string, origin = INCHEON_ORIGIN): IncheonNoticeDetail {
  const $ = cheerio.load(html);
  const view = $('.board-view').first();
  const meta = (label: string) =>
    clean(
      view
        .find('.board-view-meta dl')
        .filter((_, dl) => $(dl).find('dt').text().trim() === label)
        .first()
        .find('dd')
        .text(),
    );

  const body = view.find('.board-view-contents').first();
  body.find('br').replaceWith('\n');
  body.find('p, div').each((_, el) => {
    $(el).append('\n');
  });
  const bodyText = body
    .text()
    .replace(/ /g, ' ')
    .split('\n')
    .map(line => line.replace(/\s+/g, ' ').trim())
    .filter((line, i, arr) => line.length > 0 || (i > 0 && arr[i - 1].length > 0))
    .join('\n')
    .trim();

  const attachments: IncheonAttachment[] = [];
  view.find('.file-preview-down-group').each((_, group) => {
    const name = clean($(group).find('.file-name').first().text());
    const href = $(group).find('a[href*="/comm/getFile"]').first().attr('href');
    if (!name || !href) return;
    const ext = name.includes('.') ? name.slice(name.lastIndexOf('.') + 1).toLowerCase() : '';
    attachments.push({ name, ext, url: href.startsWith('http') ? href : `${origin}${href}` });
  });

  return { title: clean(view.find('.board-view-title').first().text()), department: meta('담당부서'), registeredAt: meta('작성일'), bodyText, attachments };
}

/**
 * 공고문 첨부를 고른다 (보령과 같은 규칙): HWP/HWPX 중 이름(공백 제거)에 '공고' 가 든 것 → 서식·악보가 아닌 첫 HWP/HWPX → 첫 HWP/HWPX
 * → PDF 도 같은 순서(지정곡 악보 'Excerpts' · '악보' 는 공고문이 아니다). zip·이미지는 고르지 않는다.
 */
export function pickIncheonNoticeAttachment(attachments: IncheonAttachment[]): IncheonAttachment | undefined {
  const compact = (a: IncheonAttachment) => a.name.replace(/\s+/g, '');
  const isFormOrScore = (a: IncheonAttachment) => /서식|지원서|응시|악보|지정곡|excerpt/i.test(compact(a));
  const pick = (exts: string[]) => {
    const files = attachments.filter(a => exts.includes(a.ext));
    return files.find(a => compact(a).includes('공고')) ?? files.find(a => !isFormOrScore(a)) ?? files[0];
  };
  return pick(['hwpx', 'hwp']) ?? pick(['pdf']);
}
