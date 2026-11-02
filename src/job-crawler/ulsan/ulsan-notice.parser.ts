import * as cheerio from 'cheerio';

export interface UlsanNoticeRow {
  /** 게시글 번호 (bod_sn) */
  bodSn: string;
  title: string;
  writer: string;
  /** 등록일 YYYY-MM-DD */
  registeredAt: string;
  /** 상단 고정 공지([공지]) 여부 — 매 페이지 반복되고 등록일 순서와 무관 */
  pinned: boolean;
  /** 상세 페이지 절대 URL */
  url: string;
}

export interface UlsanAttachment {
  /** 사용자에게 보이는 파일명 (확장자 포함) */
  name: string;
  /** 소문자 확장자 (점 제외) */
  ext: string;
  /** 다운로드 절대 URL (board_download.do?mnu_code=&bod_sn=&file_sn=) */
  url: string;
}

export interface UlsanNoticeDetail {
  title: string;
  /** 본문 텍스트 (줄바꿈은 \n) */
  bodyText: string;
  attachments: UlsanAttachment[];
}

const ORIGIN = 'https://www.ulsan.go.kr';
const PAGE_PATH = '/ucac/art/page.do';

export function ulsanDetailUrl(menuCode: string, bodSn: string, origin = ORIGIN): string {
  return `${origin}${PAGE_PATH}?mnu_code=${menuCode}&bod_sn=${bodSn}&cmd=2`;
}

/** 공지사항 목록 (table.normal_list 의 각 행: No.(번호 또는 [공지]) · 제목 · 작성자 · 등록일 · 조회) */
export function parseUlsanNoticeList(html: string, menuCode: string, origin = ORIGIN): UlsanNoticeRow[] {
  const $ = cheerio.load(html);
  const rows: UlsanNoticeRow[] = [];
  $('table.normal_list tbody tr').each((_, tr) => {
    const tds = $(tr).find('td');
    const link = tds.eq(1).find('a').first();
    const href = link.attr('href') ?? '';
    const bodSn = /[?&]bod_sn=(\d+)/.exec(href)?.[1];
    if (!bodSn) return;
    const title = (link.find('.title_in').first().text() || link.attr('title') || '').replace(/\s+/g, ' ').trim();
    const registeredAt = tds.eq(3).text().trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(registeredAt)) return;
    rows.push({
      bodSn,
      title,
      writer: tds.eq(2).text().replace(/\s+/g, ' ').trim(),
      registeredAt,
      pinned: tds.eq(0).text().includes('공지'),
      url: ulsanDetailUrl(menuCode, bodSn, origin),
    });
  });
  return rows;
}

/** 상세 페이지: 제목(.board_view_title_topic) · 본문(.board_view_info) · 첨부(.board_view_file a[href]) */
export function parseUlsanNoticeDetail(html: string, origin = ORIGIN): UlsanNoticeDetail {
  const $ = cheerio.load(html);
  const title = $('.board_view_title_topic').first().text().replace(/\s+/g, ' ').trim();
  const body = $('.board_view_info').first();
  body.find('br').replaceWith('\n');
  body.find('p, div').each((_, el) => {
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

  const attachments: UlsanAttachment[] = [];
  $('.board_view_file a[href*="board_download"]').each((_, a) => {
    const href = $(a).attr('href') ?? '';
    const name = ($(a).attr('title') || $(a).text()).replace(/\s+/g, ' ').trim();
    if (!name) return;
    const ext = name.includes('.') ? name.slice(name.lastIndexOf('.') + 1).toLowerCase() : '';
    attachments.push({ name, ext, url: href.startsWith('http') ? href : `${origin}${href}` });
  });
  return { title, bodyText, attachments };
}

/**
 * 공고문 첨부를 고른다 (목포와 같은 규칙, PDF 는 HWP 가 없을 때 대신 쓴다):
 * HWP/HWPX 중 이름(공백 제거)에 '공고' 가 들어간 것 → 첫 HWP/HWPX → PDF 중 '공고' 가 들어간 것 → 첫 PDF.
 * 서식·지원서 파일은 이름에 '서식'·'지원서'·'응시' 가 들어가 뒤로 밀린다.
 */
export function pickUlsanNoticeAttachment(attachments: UlsanAttachment[]): UlsanAttachment | undefined {
  const compact = (a: UlsanAttachment) => a.name.replace(/\s+/g, '');
  const isForm = (a: UlsanAttachment) => /서식|지원서|응시/.test(compact(a));
  const pick = (exts: string[]) => {
    const files = attachments.filter(a => exts.includes(a.ext));
    return files.find(a => compact(a).includes('공고')) ?? files.find(a => !isForm(a)) ?? files[0];
  };
  return pick(['hwpx', 'hwp']) ?? pick(['pdf']);
}
