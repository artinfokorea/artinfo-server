import * as cheerio from 'cheerio';

export interface MokpoNoticeRow {
  idx: string;
  title: string;
  department: string;
  /** 등록일 YYYY-MM-DD */
  registeredAt: string;
  /** 상세 페이지 절대 URL */
  url: string;
}

export interface MokpoAttachment {
  /** 사용자에게 보이는 파일명 (확장자 포함) */
  name: string;
  /** 소문자 확장자 (점 제외) */
  ext: string;
  sysFileName: string;
  filePath: string;
}

export interface MokpoNoticeDetail {
  title: string;
  /** 본문 텍스트 (줄바꿈은 \n) */
  bodyText: string;
  csrfToken: string;
  attachments: MokpoAttachment[];
}

const LIST_PATH = '/www/mokpo_news/notification/public_notice';

/** 고시·공고 목록 페이지 (<tbody> 의 각 행: 번호 · 제목 · 부서 · 등록일 · 마감일 · 조회) */
export function parseMokpoNoticeList(html: string, origin = 'https://www.mokpo.go.kr'): MokpoNoticeRow[] {
  const $ = cheerio.load(html);
  const rows: MokpoNoticeRow[] = [];
  $('tbody tr').each((_, tr) => {
    const tds = $(tr).find('td');
    const link = tds.eq(1).find('a').first();
    const href = link.attr('href') ?? '';
    const idx = /[?&]idx=(\d+)/.exec(href)?.[1];
    if (!idx) return;
    const title = link.clone().children().remove().end().text().replace(/\s+/g, ' ').trim();
    const registeredAt = tds.eq(3).text().trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(registeredAt)) return;
    rows.push({
      idx,
      title,
      department: tds.eq(2).text().trim(),
      registeredAt,
      url: `${origin}${LIST_PATH}?idx=${idx}&mode=view`,
    });
  });
  return rows;
}

/** 상세 페이지: 제목 · 본문 · 첨부파일(goDownLoad 인자) · CSRF 토큰 */
export function parseMokpoNoticeDetail(html: string): MokpoNoticeDetail {
  const $ = cheerio.load(html);
  const title = $('.view_titlebox h3').first().text().replace(/\s+/g, ' ').trim();
  const body = $('.text_viewbox').first();
  body.find('br').replaceWith('\n');
  body.find('p, div').each((_, el) => {
    $(el).append('\n');
  });
  const bodyText = body
    .text()
    .split('\n')
    .map(line => line.replace(/\s+/g, ' ').trim())
    .filter((line, i, arr) => line.length > 0 || (i > 0 && arr[i - 1].length > 0))
    .join('\n')
    .trim();
  const csrfToken = $('form[name="nnn"] input[name="csrf_token"]').attr('value') ?? '';

  const attachments: MokpoAttachment[] = [];
  $('.file_viewbox a[onclick]').each((_, a) => {
    const onclick = $(a).attr('onclick') ?? '';
    const m = /goDownLoad\('((?:[^'\\]|\\.)*)'\s*,\s*'((?:[^'\\]|\\.)*)'\s*,\s*'((?:[^'\\]|\\.)*)'\)/.exec(onclick);
    if (!m) return;
    const name = m[1].trim();
    const ext = name.includes('.') ? name.slice(name.lastIndexOf('.') + 1).toLowerCase() : '';
    attachments.push({ name, ext, sysFileName: m[2], filePath: m[3] });
  });
  return { title, bodyText, csrfToken, attachments };
}

/**
 * 공고문 첨부를 고른다: HWP/HWPX 중 이름(공백 제거)에 '공고문' 또는 '모집공고' 가 들어간 것 → '공고' 가 들어간 것 → 첫 HWP/HWPX.
 */
export function pickNoticeAttachment(attachments: MokpoAttachment[]): MokpoAttachment | undefined {
  const hwp = attachments.filter(a => a.ext === 'hwpx' || a.ext === 'hwp');
  const compact = (a: MokpoAttachment) => a.name.replace(/\s+/g, '');
  return hwp.find(a => compact(a).includes('공고문') || compact(a).includes('모집공고')) ?? hwp.find(a => compact(a).includes('공고')) ?? hwp[0];
}
