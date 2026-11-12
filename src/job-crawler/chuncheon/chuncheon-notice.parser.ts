import * as cheerio from 'cheerio';

export interface ChuncheonNoticeRow {
  /** 게시글 번호 (a.btn-board-view 의 data-seq, 예: 13696) */
  id: string;
  /** 게시판 분류: 채용진행 · 채용마감 · 채용결과 · 합격공고 */
  category: string;
  title: string;
  department: string;
  /** 등록일 YYYY-MM-DD */
  registeredAt: string;
  /** 번호 칸이 확성기 아이콘(alt="공지")인 상단 고정 글 — 1페이지에만 나온다 */
  pinned: boolean;
  /** 상세 페이지 절대 URL (recruitSiteUrl · 중복 판정 키) */
  url: string;
}

export interface ChuncheonAttachment {
  /** 사용자에게 보이는 파일명 (확장자 포함) */
  name: string;
  /** 소문자 확장자 (점 제외) */
  ext: string;
  /** 다운로드 절대 URL (/egf/bp/common/front/{fileId}/download) — 쿠키·Referer 없이 받을 수 있다 */
  url: string;
}

export interface ChuncheonBodyImage {
  /** 파일명 (URL 마지막 조각, 디코드) */
  name: string;
  url: string;
}

export interface ChuncheonNoticeDetail {
  /** 제목 (앞의 '[채용진행]' 분류 표시는 뗀다) */
  title: string;
  department: string;
  /** 등록일 YYYY-MM-DD */
  registeredAt: string;
  /** 본문 텍스트 (줄바꿈은 \n, 이미지는 따로) */
  bodyText: string;
  /** 본문에 든 이미지 — 춘천은 공고문을 그림으로 올린다 (/upload/image_attach/…jpg) */
  images: ChuncheonBodyImage[];
  attachments: ChuncheonAttachment[];
}

export const CHUNCHEON_ORIGIN = 'https://cccf.or.kr';
export const CHUNCHEON_BOARD_PATH = '/art/company_news/recruit_notice';

export function chuncheonDetailUrl(id: string, origin = CHUNCHEON_ORIGIN): string {
  return `${origin}${CHUNCHEON_BOARD_PATH}?articleSeq=${id}`;
}

const clean = (text: string) => text.replace(/ /g, ' ').replace(/\s+/g, ' ').trim();
const absolute = (origin: string, url: string) => (url.startsWith('http') ? url : `${origin}${url.startsWith('/') ? '' : '/'}${url}`);
const fileName = (url: string) => decodeURIComponent(url.slice(url.lastIndexOf('/') + 1).split('?')[0]);

/**
 * 춘천시립예술단 채용공고 목록 (table.skinTb tbody tr: 번호(고정 글은 확성기 아이콘) · 분류 · 제목(a.btn-board-view[data-seq]) · 작성자 · 등록일 · 첨부 · 조회).
 * 등록일 내림차순 10건씩, ?pageIndex=N. 고정 글은 1페이지에만 나온다.
 */
export function parseChuncheonNoticeList(html: string, origin = CHUNCHEON_ORIGIN): ChuncheonNoticeRow[] {
  const $ = cheerio.load(html);
  const rows: ChuncheonNoticeRow[] = [];
  $('table.skinTb tbody tr').each((_, tr) => {
    const link = $(tr).find('td.skinTb-sbj a.btn-board-view').first();
    const id = link.attr('data-seq');
    if (!id || !/^\d+$/.test(id)) return;
    const registeredAt = clean($(tr).find('td.skinTb-date').text());
    if (!/^\d{4}-\d{2}-\d{2}$/.test(registeredAt)) return;
    rows.push({
      id,
      category: clean($(tr).find('td[data-seq="first"]').text()),
      title: clean(link.text()),
      department: clean($(tr).find('td.skinTb-name').text()),
      registeredAt,
      pinned: $(tr).find('td').first().find('img[alt="공지"]').length > 0,
      url: chuncheonDetailUrl(id, origin),
    });
  });
  return rows;
}

/**
 * 상세 (div.skinTb-data-bgSbj): 제목 .skinTb-sbj ('[채용진행]' 접두) · 작성자 .skinTb-name · 등록일 .skinTb-date ·
 * 첨부 .attachFile a[href$="/download"] · 본문 .skinTb-conts (<p>·<br> 은 줄바꿈, <img> 는 images 로)
 */
export function parseChuncheonNoticeDetail(html: string, origin = CHUNCHEON_ORIGIN): ChuncheonNoticeDetail {
  const $ = cheerio.load(html);
  const view = $('.skinTb-data-bgSbj').first();

  const images: ChuncheonBodyImage[] = [];
  const body = view.find('.skinTb-conts').first();
  body.find('img').each((_, img) => {
    const src = $(img).attr('src');
    if (!src) return;
    const url = absolute(origin, src);
    images.push({ name: fileName(url), url });
  });
  body.find('img').remove();
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

  const attachments: ChuncheonAttachment[] = [];
  view.find('.attachFile a[href*="/download"]').each((_, a) => {
    const href = $(a).attr('href');
    const name = clean($(a).text());
    if (!href || !name) return;
    const ext = name.includes('.') ? name.slice(name.lastIndexOf('.') + 1).toLowerCase() : '';
    attachments.push({ name, ext, url: absolute(origin, href) });
  });

  return {
    title: clean(view.find('.skinTb-sbj').first().text()).replace(/^\[[^\]]*\]\s*/, ''),
    department: clean(view.find('.skinTb-name').first().text()),
    registeredAt: clean(view.find('.skinTb-date').first().text()),
    bodyText,
    images,
    attachments,
  };
}

const compactName = (name: string) => name.replace(/\s+/g, '');
/** 응시원서·동의서·자기소개서 서식과 과제곡·지정곡 악보는 공고문이 아니다 */
const isFormOrScore = (name: string) => /서식|지원서|응시원서|원서|동의서|자기소개서|지정곡|과제곡|자유곡|악보|excerpt/i.test(compactName(name));

/**
 * 공고문 첨부를 고른다: HWP/HWPX/PDF 중 이름에 '공고' 가 든 것 → 서식·악보가 아닌 것. 서식·악보뿐이면 없음(본문 이미지가 공고문).
 * 춘천은 보통 응시원서 hwp + 과제곡 pdf 만 붙이고 공고문은 본문 이미지로 올린다.
 */
export function pickChuncheonNoticeDocument(attachments: ChuncheonAttachment[]): ChuncheonAttachment | undefined {
  const docs = attachments.filter(a => ['hwpx', 'hwp', 'pdf'].includes(a.ext));
  return docs.find(a => compactName(a.name).includes('공고')) ?? docs.find(a => !isFormOrScore(a.name));
}
