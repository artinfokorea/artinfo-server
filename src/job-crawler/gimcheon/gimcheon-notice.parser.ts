import * as cheerio from 'cheerio';

export interface GimcheonNoticeRow {
  /** 게시글 번호 (goTo.view('list','{bIdx}', …) 의 bIdx, 예: 4544687) */
  id: string;
  title: string;
  department: string;
  /** 작성일 YYYY-MM-DD */
  registeredAt: string;
  /** 번호 칸이 '공지' 인 상단 고정 글 (이 게시판은 2026-11 기준 없지만 다른 eGov 게시판과 같은 꼴이라 대비) */
  pinned: boolean;
  /** 첨부 아이콘이 있는 글 */
  hasFile: boolean;
  /** 상세 페이지 절대 URL (recruitSiteUrl · 중복 판정 키) */
  url: string;
}

export interface GimcheonAttachment {
  /** 사용자에게 보이는 파일명 (확장자 포함) */
  name: string;
  /** 소문자 확장자 (점 제외) */
  ext: string;
  /** 다운로드 절대 URL (/cmm/fms/FileDown.do?atchFileId=&fileSn=) — 쿠키·Referer 없이 받을 수 있다 */
  url: string;
}

export interface GimcheonNoticeDetail {
  title: string;
  department: string;
  /** 등록일 YYYY-MM-DD */
  registeredAt: string;
  /** 본문 텍스트 (줄바꿈은 \n) */
  bodyText: string;
  attachments: GimcheonAttachment[];
}

export const GIMCHEON_ORIGIN = 'https://www.gc.go.kr';
export const GIMCHEON_BOARD = { ptIdx: '1807', mId: '0601000000', searchCategory: 'gcart' };

export function gimcheonDetailUrl(id: string, origin = GIMCHEON_ORIGIN, board = GIMCHEON_BOARD): string {
  return `${origin}/gcart/bbs/view.do?bIdx=${id}&ptIdx=${board.ptIdx}&mId=${board.mId}`;
}

const clean = (text: string) => text.replace(/ /g, ' ').replace(/\s+/g, ' ').trim();

/**
 * 김천시문화예술회관 공지사항 목록 (table.bod_list tbody tr: 번호 · 제목(a onclick="goTo.view('list','{bIdx}',…)") · 파일 아이콘 · 작성자 · 작성일 · 조회).
 * 작성일 내림차순 10건씩, ?page=N.
 */
export function parseGimcheonNoticeList(html: string, origin = GIMCHEON_ORIGIN, board = GIMCHEON_BOARD): GimcheonNoticeRow[] {
  const $ = cheerio.load(html);
  const rows: GimcheonNoticeRow[] = [];
  $('table.bod_list tbody tr').each((_, tr) => {
    const link = $(tr).find('td.list_tit a').first();
    const id = /goTo\.view\('list','(\d+)'/.exec(link.attr('onclick') ?? '')?.[1];
    if (!id) return;
    const registeredAt = clean($(tr).find('td.list_date').text());
    if (!/^\d{4}-\d{2}-\d{2}$/.test(registeredAt)) return;
    rows.push({
      id,
      title: clean(link.text()),
      department: clean($(tr).find('td.list_write').text()),
      registeredAt,
      pinned: clean($(tr).find('td.list_num').text()).includes('공지'),
      hasFile: $(tr).find('td.list_file img').length > 0,
      url: gimcheonDetailUrl(id, origin, board),
    });
  });
  return rows;
}

/**
 * 상세 (div.bod_view): 제목 h4 · 메타 ul.clFix (li.view_write 작성자 / li.view_date 등록일) · 본문 .view_cont (<br>·p 는 줄바꿈) ·
 * 첨부 #updateFileList li a[onclick="fn_egov_downFile('{atchFileId}','{fileSn}')"] — span 이 파일명, 뒤에 [크기]
 */
export function parseGimcheonNoticeDetail(html: string, origin = GIMCHEON_ORIGIN): GimcheonNoticeDetail {
  const $ = cheerio.load(html);
  const view = $('.bod_view').first();
  const meta = (selector: string) => clean(view.find(selector).first().text()).replace(/^[^:]*:\s*/, '');

  const body = view.find('.view_cont').first();
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

  const attachments: GimcheonAttachment[] = [];
  view.find('#updateFileList a[onclick*="fn_egov_downFile"]').each((_, a) => {
    const ids = /fn_egov_downFile\('([^']+)','([^']+)'\)/.exec($(a).attr('onclick') ?? '');
    const name = clean($(a).find('span').first().text());
    if (!ids || !name) return;
    const ext = name.includes('.') ? name.slice(name.lastIndexOf('.') + 1).toLowerCase() : '';
    attachments.push({ name, ext, url: `${origin}/cmm/fms/FileDown.do?atchFileId=${ids[1]}&fileSn=${ids[2]}` });
  });

  return { title: clean(view.find('h4').first().text()), department: meta('.view_write'), registeredAt: meta('.view_date'), bodyText, attachments };
}

/**
 * 공고문 첨부를 고른다 (인천과 같은 규칙): HWP/HWPX 중 이름(공백 제거)에 '공고' 가 든 것 → 서식·악보가 아닌 첫 HWP/HWPX → 첫 HWP/HWPX
 * → PDF 도 같은 순서. zip·이미지는 고르지 않는다.
 */
export function pickGimcheonNoticeAttachment(attachments: GimcheonAttachment[]): GimcheonAttachment | undefined {
  const compact = (a: GimcheonAttachment) => a.name.replace(/\s+/g, '');
  const isFormOrScore = (a: GimcheonAttachment) => /서식|지원서|응시|악보|지정곡|excerpt/i.test(compact(a));
  const pick = (exts: string[]) => {
    const files = attachments.filter(a => exts.includes(a.ext));
    return files.find(a => compact(a).includes('공고')) ?? files.find(a => !isFormOrScore(a)) ?? files[0];
  };
  return pick(['hwpx', 'hwp']) ?? pick(['pdf']);
}
