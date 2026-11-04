import * as cheerio from 'cheerio';

export interface SeosanNoticeRow {
  /** 고시공고 관리번호 (not_ancmt_mgt_no) */
  mgtNo: string;
  /** 고시공고번호 (예: 서산시 공고 제2025-2239호) */
  noticeNo: string;
  title: string;
  department: string;
  /** 등록일 YYYY-MM-DD */
  registeredAt: string;
  /** 상세 페이지 절대 URL (recruitSiteUrl · 중복 판정 키) */
  url: string;
}

export interface SeosanAttachment {
  /** 사용자에게 보이는 파일명 (확장자 포함) */
  name: string;
  /** 소문자 확장자 (점 제외) */
  ext: string;
  sysFileName: string;
  filePath: string;
  /** 다운로드 절대 URL (eminwon FileDown.jsp GET) — 쿠키 없이 받을 수 있다 */
  url: string;
}

export interface SeosanNoticeDetail {
  title: string;
  noticeNo: string;
  /** 등록일 YYYY-MM-DD */
  registeredAt: string;
  department: string;
  /** 본문 텍스트 (줄바꿈은 \n) */
  bodyText: string;
  attachments: SeosanAttachment[];
}

const ORIGIN = 'https://www.seosan.go.kr';
const EMINWON_ORIGIN = 'https://eminwon.seosan.go.kr';
export const SEOSAN_VIEW_PATH = '/common/program/eminwonView.jsp';

/** 상세 URL. jndinm·context·homepage_pbs_yn·subCheck 가 빠지면 eminwon 이 500 을 돌려준다 */
export function seosanDetailUrl(mgtNo: string, origin = ORIGIN): string {
  const params = new URLSearchParams({
    jndinm: 'OfrNotAncmtEJB',
    context: 'NTIS',
    method: 'selectOfrNotAncmt',
    methodnm: 'selectOfrNotAncmtRegst',
    homepage_pbs_yn: 'Y',
    subCheck: 'Y',
    not_ancmt_se_code: '05',
    not_ancmt_mgt_no: mgtNo,
  });
  return `${origin}${SEOSAN_VIEW_PATH}?${params.toString()}`;
}

/** 첨부 다운로드 URL — 페이지의 goDownLoad() 와 같은 방식 (encodeURI 대신 encodeURIComponent, 결과는 같은 파일) */
export function seosanDownloadUrl(userFileName: string, sysFileName: string, filePath: string, origin = EMINWON_ORIGIN): string {
  return `${origin}/emwp/jsp/ofr/FileDown.jsp?user_file_nm=${encodeURIComponent(userFileName)}&sys_file_nm=${encodeURIComponent(sysFileName)}&file_path=${encodeURIComponent(filePath)}`;
}

const clean = (text: string) => text.replace(/ /g, ' ').replace(/\s+/g, ' ').trim();

/** 채용공고 목록 (table.bbs_default.list 의 각 행: 번호 · 고시공고번호 · 제목 · 담당부서 · 등록일 · 조회수, 행마다 searchDetail('관리번호')) */
export function parseSeosanNoticeList(html: string, origin = ORIGIN): SeosanNoticeRow[] {
  const $ = cheerio.load(html);
  const rows: SeosanNoticeRow[] = [];
  $('table.bbs_default tbody tr').each((_, tr) => {
    const tds = $(tr).find('td');
    if (tds.length < 5) return;
    const mgtNo = /searchDetail\('(\d+)'\)/.exec(tds.eq(2).find('a').attr('onclick') ?? tds.eq(0).attr('onclick') ?? '')?.[1];
    if (!mgtNo) return;
    const registeredAt = clean(tds.eq(4).text());
    if (!/^\d{4}-\d{2}-\d{2}$/.test(registeredAt)) return;
    rows.push({
      mgtNo,
      noticeNo: clean(tds.eq(1).text()),
      title: clean(tds.eq(2).text()),
      department: clean(tds.eq(3).text()),
      registeredAt,
      url: seosanDetailUrl(mgtNo, origin),
    });
  });
  return rows;
}

/**
 * 상세 페이지 (table.bbs_default.view): th 라벨 옆 td 로 제목·고시공고번호·등록일·담당부서,
 * 본문은 td.bbs_content (&nbsp; 는 공백, <br> 은 줄바꿈), 첨부는 a[href="javascript:goDownLoad('이름','시스템파일명','경로')"]
 */
export function parseSeosanNoticeDetail(html: string): SeosanNoticeDetail {
  const $ = cheerio.load(html);
  const view = $('table.bbs_default').first();
  const cellAfter = (label: string) =>
    clean(
      view
        .find('th')
        .filter((_, th) => clean($(th).text()) === label)
        .first()
        .next('td')
        .text(),
    );

  const body = view.find('td.bbs_content').first();
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

  const attachments: SeosanAttachment[] = [];
  view.find('a[href^="javascript:goDownLoad"]').each((_, a) => {
    const m = /goDownLoad\('((?:[^'\\]|\\.)*)'\s*,\s*'((?:[^'\\]|\\.)*)'\s*,\s*'((?:[^'\\]|\\.)*)'\)/.exec($(a).attr('href') ?? '');
    if (!m) return;
    const name = clean(m[1]);
    if (!name) return;
    const ext = name.includes('.') ? name.slice(name.lastIndexOf('.') + 1).toLowerCase() : '';
    attachments.push({ name, ext, sysFileName: m[2], filePath: m[3], url: seosanDownloadUrl(m[1], m[2], m[3]) });
  });

  return {
    title: cellAfter('제목'),
    noticeNo: cellAfter('고시공고번호'),
    registeredAt: cellAfter('등록일'),
    department: cellAfter('담당부서'),
    bodyText,
    attachments,
  };
}

/**
 * 공고문 첨부를 고른다 (보령과 같은 규칙): HWP/HWPX 중 이름(공백 제거)에 '공고' 가 들어간 것 → 서식이 아닌 첫 HWP/HWPX → 첫 HWP/HWPX
 * → 없으면 PDF 도 같은 순서인데 지정곡 '악보' 는 뺀다. 이미지는 고르지 않는다.
 */
export function pickSeosanNoticeAttachment(attachments: SeosanAttachment[]): SeosanAttachment | undefined {
  const compact = (a: SeosanAttachment) => a.name.replace(/\s+/g, '');
  const isForm = (a: SeosanAttachment) => /서식|지원서|응시/.test(compact(a));
  const pick = (exts: string[], exclude?: RegExp) => {
    const files = attachments.filter(a => exts.includes(a.ext) && !(exclude && exclude.test(compact(a))));
    return files.find(a => compact(a).includes('공고')) ?? files.find(a => !isForm(a)) ?? files[0];
  };
  return pick(['hwpx', 'hwp']) ?? pick(['pdf'], /악보/);
}
