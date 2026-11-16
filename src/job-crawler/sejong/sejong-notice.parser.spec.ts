import * as fs from 'fs';
import * as path from 'path';
import { parseSejongNoticeDetail, parseSejongNoticeList, pickSejongFallbackDocument, pickSejongNoticeDocument } from './sejong-notice.parser';

/**
 * 스펙 (실제 페이지 픽스처, 2026-11-16 기준 세종문화회관 채용공고):
 * 1) 목록 1페이지는 일반 10행(고정 글 없음). nttId·제목·날짜·상세 URL 을 읽고 날짜 내림차순이다
 * 2) 2페이지도 일반 10행
 * 3) 상세 50240(2026 서울시예술단 일반단원): 제목 · 작성일(목록 날짜 11-10 과 달리 11-09) · 본문 글(표는 ' | ' 로 한 줄) · 본문 이미지 1장(career.co.kr) · 첨부 3개(세부사항 hwpx · 가점 hwpx · 악보 zip)
 * 4) 상세 50176(예술단 직책단원): 본문은 incruit 그림 한 장뿐(bodyText 빈 문자열) · 첨부 3개(직무기술서 hwpx ×2 · 평가기준 pdf)
 * 5) 공고문 첨부 고르기: 보조 자료뿐이면 없음 → '공고' 가 든 HWP/PDF 가 있으면 그것. 보조 문서 폴백은 서식·악보를 뺀 첫 문서
 * 6) bodyHtml: 표는 <figure class="table"><table> 로 감싸고 rowspan/colspan 만 남긴다. 인라인 스타일·클래스·div·span·img·script 는 없다. 그림뿐인 글은 ''
 */
const fixture = (name: string) => fs.readFileSync(path.join(__dirname, '__fixtures__', name), 'utf8');
const FILE = (atch: string, sn: number) => `https://www.sejongpac.or.kr/portal/cmmn/file/fileDown.do?atchFileId=${atch}&fileSn=${sn}&bbsId=B0000065`;

describe('parseSejongNoticeList', () => {
  it('1페이지 10행 — 번호·제목·날짜·상세 URL, 날짜 내림차순', () => {
    const rows = parseSejongNoticeList(fixture('list-2026-11-16-p1.html'));
    expect(rows).toHaveLength(10);
    expect(rows.every(r => !r.pinned)).toBe(true);
    expect(rows[0]).toEqual({
      id: '50240',
      title: '2026 서울시예술단 일반단원 공개채용 공고',
      registeredAt: '2026-11-10',
      pinned: false,
      url: 'https://www.sejongpac.or.kr/portal/bbs/B0000065/view.do?nttId=50240&menuNo=200571',
    });
    expect(rows[4]).toMatchObject({
      id: '50176',
      title: '(재)세종문화회관 예술단 직책단원(극단 지도위원, 소년소녀합창 연습지휘자) 공개채용 공고',
      registeredAt: '2026-09-29',
    });
    expect(rows.map(r => r.registeredAt)).toEqual([
      '2026-11-10',
      '2026-11-02',
      '2026-10-15',
      '2026-10-02',
      '2026-09-29',
      '2026-09-23',
      '2026-08-25',
      '2026-07-31',
      '2026-07-27',
      '2026-07-20',
    ]);
  });

  it('2페이지도 10행', () => {
    const rows = parseSejongNoticeList(fixture('list-2026-11-16-p2.html'));
    expect(rows).toHaveLength(10);
    expect(rows[0]).toMatchObject({ id: '50066', title: '2026 서울시뮤지컬단 뮤지컬 <크리스마스 캐럴> 아역 오디션 공고', registeredAt: '2026-07-08' });
    expect(rows[7]).toMatchObject({ id: '49954', title: '(재)세종문화회관 예술단 일반단원(육아휴직대체) 채용 공고', registeredAt: '2026-04-03' });
    expect(rows[9]).toMatchObject({ id: '49913', registeredAt: '2026-03-11' });
  });

  it('번호 칸이 숫자가 아니면 고정 글, 표가 없으면 빈 배열', () => {
    const pinned = fixture('list-2026-11-16-p1.html').replace(/<td class="num">\s*588\s*<\/td>/, '<td class="num">공지</td>');
    expect(parseSejongNoticeList(pinned)[0]).toMatchObject({ id: '50240', pinned: true });
    expect(parseSejongNoticeList('<html><body>점검 중</body></html>')).toEqual([]);
  });
});

describe('parseSejongNoticeDetail', () => {
  it('50240 — 제목·작성일·본문 글(표는 한 줄)·본문 이미지·첨부 3개', () => {
    const detail = parseSejongNoticeDetail(fixture('detail-50240.html'));
    expect(detail.title).toBe('2026 서울시예술단 일반단원 공개채용 공고');
    expect(detail.writtenAt).toBe('2026-11-09');
    expect(detail.images).toEqual([{ name: 'spac_261030001.jpg', url: 'https://job3.career.co.kr/ci/202600/images/spac_261030001.jpg' }]);
    expect(detail.attachments).toEqual([
      { name: '채용분야별 실기전형 세부사항.hwpx', ext: 'hwpx', url: FILE('b67e2cdffd554e00b209d32e6636fe65', 1) },
      { name: '취업지원대상자(보훈대상자별) 적용 가점 비율.hwpx', ext: 'hwpx', url: FILE('b67e2cdffd554e00b209d32e6636fe65', 2) },
      { name: '합창 2차 실기 악보.zip', ext: 'zip', url: FILE('b67e2cdffd554e00b209d32e6636fe65', 3) },
    ]);
    const lines = detail.bodyText.split('\n');
    expect(lines[0]).toBe('1 채용개요');
    expect(lines[1]).toBe('□ 소속, 분야, 인원 및 담당업무');
    expect(lines[3]).toBe('소속 (직책) | 분야 | 채용 인원 | 담당업무(역할) | 채용방법 및 절차');
    expect(lines[5]).toBe('가야금 | 1명');
    expect(lines[7]).toBe('서울시무용단 (일반단원) | 무용 | 5명');
    expect(lines[lines.length - 2]).toBe('2026. 11. 10.');
    expect(lines[lines.length - 1]).toBe('(재)세종문화회관 사장');
    expect(detail.bodyText).not.toMatch(/<\/?(p|div|span|table|td|th|img|em)\b/);
    expect(detail.bodyText).not.toContain('font-family');
    expect(detail.bodyText).toContain('소프라노');
    expect(detail.bodyText).toContain('무용');
  });

  it('50240 — bodyHtml 은 표 구조(rowspan·colspan)를 살리고 스타일·클래스·div·span·img 는 없다', () => {
    const { bodyHtml } = parseSejongNoticeDetail(fixture('detail-50240.html'));
    expect(bodyHtml.startsWith('<p><em>1</em> 채용개요</p><p>□ 소속, 분야, 인원 및 담당업무</p><figure class="table"><table><thead><tr><th>')).toBe(true);
    expect(bodyHtml).toContain('<td rowspan="3">');
    expect(bodyHtml).toContain('<td rowspan="8"><p>회관이 제작하는 공연작품 및 기타 공연의 연습과 출연에 임하며 예술교육을 담당할 수 있다.</p></td>');
    expect(bodyHtml).toContain('<td colspan="2">');
    expect(bodyHtml).toContain('</table></figure><p>※ 채용분야별 중복지원 불가</p>');
    expect(bodyHtml).not.toMatch(/ style=| class="(?!table")|<div|<span|<img|<script|<meta|<colgroup|&nbsp;/);
    const tags = new Set((bodyHtml.match(/<([a-z0-9]+)/g) ?? []).map(t => t.slice(1)));
    expect([...tags].sort()).toEqual(['b', 'br', 'em', 'figure', 'p', 'table', 'tbody', 'td', 'th', 'thead', 'tr']);
    expect(bodyHtml.endsWith('<p>2026. 11. 10.</p><p>(재)세종문화회관 사장</p>')).toBe(true);
  });

  it('50176 — 본문은 그림 한 장뿐이라 bodyText 는 비고, 첨부는 직무기술서·평가기준', () => {
    const detail = parseSejongNoticeDetail(fixture('detail-50176.html'));
    expect(detail.title).toBe('(재)세종문화회관 예술단 직책단원(극단 지도위원, 소년소녀합창 연습지휘자) 공개채용 공고');
    expect(detail.writtenAt).toBe('2026-09-28');
    expect(detail.bodyText).toBe('');
    expect(detail.bodyHtml).toBe('');
    expect(detail.images).toEqual([{ name: 'biz_1_20260929093855371.png', url: 'https://c.incru.it/biz_file/2026/09/biz_1_20260929093855371.png' }]);
    expect(detail.attachments.map(a => [a.name, a.ext])).toEqual([
      ['직무기술서_극단 지도위원.hwpx', 'hwpx'],
      ['직무기술서_합창단,소년소녀합창단 연습 지휘자.hwpx', 'hwpx'],
      ['전형별 세부평가기준.pdf', 'pdf'],
    ]);
  });
});

describe('pickSejongNoticeDocument / pickSejongFallbackDocument', () => {
  const a = (name: string) => ({ name, ext: name.slice(name.lastIndexOf('.') + 1).toLowerCase(), url: `https://x/${encodeURIComponent(name)}` });

  it('보조 자료(세부사항·가점·직무기술서·평가기준·악보)뿐이면 공고문 없음', () => {
    expect(pickSejongNoticeDocument(parseSejongNoticeDetail(fixture('detail-50240.html')).attachments)).toBeUndefined();
    expect(pickSejongNoticeDocument(parseSejongNoticeDetail(fixture('detail-50176.html')).attachments)).toBeUndefined();
  });

  it("'공고' 가 든 HWP/HWPX/PDF 를 먼저, 없으면 보조 자료가 아닌 문서", () => {
    expect(pickSejongNoticeDocument([a('응시원서.hwpx'), a('2026 단원 모집 공고문.pdf')])?.name).toBe('2026 단원 모집 공고문.pdf');
    expect(pickSejongNoticeDocument([a('응시원서.hwpx'), a('단원 모집 안내.hwp')])?.name).toBe('단원 모집 안내.hwp');
    expect(pickSejongNoticeDocument([a('공고.zip'), a('악보.pdf')])).toBeUndefined();
  });

  it('폴백은 서식·악보를 뺀 첫 문서 (세부사항·직무기술서는 허용)', () => {
    expect(pickSejongFallbackDocument(parseSejongNoticeDetail(fixture('detail-50240.html')).attachments)?.name).toBe('채용분야별 실기전형 세부사항.hwpx');
    expect(pickSejongFallbackDocument([a('응시원서.hwpx'), a('지정곡 악보.pdf')])).toBeUndefined();
  });
});
