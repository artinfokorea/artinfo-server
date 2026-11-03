import * as cheerio from 'cheerio';

export interface BoryeongNoticeRow {
  /** 게시글 번호 (nttId) */
  nttId: string;
  title: string;
  department: string;
  /** 등록일 YYYY-MM-DD */
  registeredAt: string;
  /** 상단 고정 공지 여부 — 매 페이지 반복되고 등록일 순서와 무관 */
  pinned: boolean;
  /** 상세 페이지 절대 URL (recruitSiteUrl · 중복 판정 키) */
  url: string;
}

export interface BoryeongAttachment {
  /** 사용자에게 보이는 파일명 (확장자 포함) */
  name: string;
  /** 소문자 확장자 (점 제외) */
  ext: string;
  /** 다운로드 절대 URL (FileDown.do?atchFileId=&fileSn=) — 세션 쿠키 없이 받을 수 있다 */
  url: string;
}

export interface BoryeongNoticeDetail {
  title: string;
  /** 등록일 YYYY-MM-DD */
  registeredAt: string;
  /** 본문 텍스트 (줄바꿈은 \n) */
  bodyText: string;
  attachments: BoryeongAttachment[];
}

const ORIGIN = 'https://www.brcn.go.kr';

export function boryeongDetailUrl(bbsId: string, nttId: string, origin = ORIGIN): string {
  return `${origin}/cop/bbs/${bbsId}/selectBoardArticle.do?bbsId=${bbsId}&nttId=${nttId}`;
}

export function boryeongDownloadUrl(atchFileId: string, fileSn: string, origin = ORIGIN): string {
  return `${origin}/cmm/fms/FileDown.do?atchFileId=${atchFileId}&fileSn=${fileSn}`;
}

const clean = (text: string) => text.replace(/ /g, ' ').replace(/\s+/g, ' ').trim();

/** 공지사항 목록 (table.basic_table 의 각 행: 순번(번호 또는 '공지') · 제목 · 부서명 · 등록일 · 조회 · 첨부) */
export function parseBoryeongNoticeList(html: string, bbsId: string, origin = ORIGIN): BoryeongNoticeRow[] {
  const $ = cheerio.load(html);
  const rows: BoryeongNoticeRow[] = [];
  $('table.basic_table tbody tr').each((_, tr) => {
    const tds = $(tr).find('td');
    const link = tds.eq(1).find('a[href*="selectBoardArticle"]').first();
    const nttId = /[?&]nttId=(\d+)/.exec(link.attr('href') ?? '')?.[1];
    if (!nttId) return;
    const registeredAt = tds.eq(3).text().trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(registeredAt)) return;
    rows.push({
      nttId,
      title: clean(link.text()),
      department: clean(tds.eq(2).text()),
      registeredAt,
      pinned: tds.eq(0).text().includes('공지'),
      url: boryeongDetailUrl(bbsId, nttId, origin),
    });
  });
  return rows;
}

/**
 * 상세 페이지 (div.board_view 의 표): 제목(th '제목' 옆 td) · 등록일 · 본문(td.tbl_cnts, <br> 은 줄바꿈) ·
 * 첨부(span.download 의 a[onclick="fn_egov_downFile('atchFileId','fileSn')"], 파일명은 title 의 '파일명 : …')
 */
export function parseBoryeongNoticeDetail(html: string, origin = ORIGIN): BoryeongNoticeDetail {
  const $ = cheerio.load(html);
  const view = $('.board_view').first();
  const cellAfter = (label: string) =>
    clean(
      view
        .find('th')
        .filter((_, th) => $(th).text().trim() === label)
        .first()
        .next('td')
        .text(),
    );

  const body = view.find('td.tbl_cnts').first();
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

  const attachments: BoryeongAttachment[] = [];
  view.find('span.download a[onclick*="fn_egov_downFile"]').each((_, a) => {
    const m = /fn_egov_downFile\('([^']+)'\s*,\s*'([^']+)'\)/.exec($(a).attr('onclick') ?? '');
    if (!m) return;
    const title = $(a).attr('title') ?? '';
    const name = clean(
      /파일명\s*:\s*(.+)$/.exec(title)?.[1] ??
        $(a)
          .text()
          .replace(/\([\d.]+[KMG]?B\)\s*$/, ''),
    );
    if (!name) return;
    const ext = name.includes('.') ? name.slice(name.lastIndexOf('.') + 1).toLowerCase() : '';
    attachments.push({ name, ext, url: boryeongDownloadUrl(m[1], m[2], origin) });
  });

  return { title: cellAfter('제목'), registeredAt: cellAfter('등록일'), bodyText, attachments };
}

/**
 * 공고문 첨부를 고른다 (울산과 같은 규칙): HWP/HWPX 중 이름(공백 제거)에 '공고' 가 들어간 것 → 서식이 아닌 첫 HWP/HWPX → 첫 HWP/HWPX
 * → PDF 도 같은 순서. zip(지정곡 등)·이미지는 고르지 않는다.
 */
export function pickBoryeongNoticeAttachment(attachments: BoryeongAttachment[]): BoryeongAttachment | undefined {
  const compact = (a: BoryeongAttachment) => a.name.replace(/\s+/g, '');
  const isForm = (a: BoryeongAttachment) => /서식|지원서|응시/.test(compact(a));
  const pick = (exts: string[]) => {
    const files = attachments.filter(a => exts.includes(a.ext));
    return files.find(a => compact(a).includes('공고')) ?? files.find(a => !isForm(a)) ?? files[0];
  };
  return pick(['hwpx', 'hwp']) ?? pick(['pdf']);
}
