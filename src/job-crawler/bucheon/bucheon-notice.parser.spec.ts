import * as fs from 'fs';
import * as path from 'path';
import { fileNameAndExt, parseBucheonNoticeDetail, parseBucheonNoticeList, pickBucheonNoticeDocument, pickBucheonNoticeZip } from './bucheon-notice.parser';

/**
 * 스펙 (실제 페이지 픽스처, 2026-11-05 기준 부천시립예술단 누리집):
 * 1) 공지사항 목록 1페이지 10행 — atcId · 제목(새글 표시는 뗀다, &lt; 는 풀어서) · 작성일 · view.do?atcId= URL. 2페이지도 10행
 * 2) 단원채용 목록 1페이지 10행 — fn_viewPage('RM…') 의 rcrtId · 제목 · 등록일(td.date01) · view.do?rcrtId= URL. 2페이지는 7행
 * 3) 공지사항 상세(채용 공고): 제목 · 작성일 · 본문은 이미지 7장뿐(텍스트 없음) · 첨부 zip 1개 (Referer 가 필요한 /file/download.do)
 * 4) 단원채용 상세: 접수기간·발표일자·채용문의 줄 + 본문(&nbsp; 는 공백) · 첨부 zip 의 '(203.0KB)' 는 뗀다 · 이미지 없음
 * 5) 공고문 고르기: '공고' 든 HWP → '공고' 든 PDF → 서식·지정곡이 아닌 HWP → PDF. 서식·지정곡만 있으면 없음. ZIP 은 '공고' 든 것 우선
 */
const fixture = (name: string) => fs.readFileSync(path.join(__dirname, '__fixtures__', name), 'utf8');

describe('parseBucheonNoticeList', () => {
  it('공지사항 목록: atcId · 제목 · 작성일 · URL', () => {
    const rows = parseBucheonNoticeList(fixture('article-list-2026-11-05-p1.html'), 'article');
    expect(rows).toHaveLength(10);
    expect(rows[0]).toEqual({
      board: 'article',
      id: 'AT026088',
      title: '[안내] 11월 5일 <부천시립합창단 해설음악회> 앵콜곡 안내',
      registeredAt: '2026-11-05',
      url: 'https://www.bucheonphil.or.kr/front/M0000025/article/view.do?atcId=AT026088',
    });
    expect(rows[1]).toEqual({
      board: 'article',
      id: 'AT026086',
      title: '[공고] 부천시립합창단 상임단원 채용 공고',
      registeredAt: '2026-11-04',
      url: 'https://www.bucheonphil.or.kr/front/M0000025/article/view.do?atcId=AT026086',
    });
    expect(rows[7].title).toBe('[공고] 부천시립합창단 상임단원 채용 최종합격자 공고');
    expect(rows[9].registeredAt).toBe('2026-06-25');
    expect(parseBucheonNoticeList(fixture('article-list-2026-11-05-p2.html'), 'article')).toHaveLength(10);
  });

  it('단원채용 목록: rcrtId · 제목 · 등록일 · URL', () => {
    const rows = parseBucheonNoticeList(fixture('recruit-list-2026-11-05-p1.html'), 'recruit');
    expect(rows).toHaveLength(10);
    expect(rows[0]).toEqual({
      board: 'recruit',
      id: 'RM000035',
      title: '부천시립합창단 단원 채용',
      registeredAt: '2026-06-01',
      url: 'https://www.bucheonphil.or.kr/front/M0000061/recruit/view.do?rcrtId=RM000035',
    });
    expect(rows[1]).toMatchObject({ id: 'RM000034', title: '부천필하모닉오케스트라 비상임단원 채용', registeredAt: '2026-05-19' });
    expect(rows[3].title).toBe('부천시립합창단 <2025 신예 작곡가 작품 공모>');
    expect(parseBucheonNoticeList(fixture('recruit-list-2026-11-05-p2.html'), 'recruit')).toHaveLength(7);
  });

  it('게시판 표가 없으면 빈 목록', () => {
    expect(parseBucheonNoticeList('<html><body><p>없음</p></body></html>', 'article')).toEqual([]);
  });
});

describe('parseBucheonNoticeDetail', () => {
  it('공지사항 채용 공고: 본문은 이미지 7장, 첨부는 zip 1개', () => {
    const detail = parseBucheonNoticeDetail(fixture('article-detail-AT026086.html'));
    expect(detail.title).toBe('[공고] 부천시립합창단 상임단원 채용 공고');
    expect(detail.registeredAt).toBe('2026-11-04');
    expect(detail.bodyText).toBe('');
    expect(detail.images).toHaveLength(7);
    expect(detail.images[0]).toEqual({ name: '1793770401025.png', url: 'https://www.bucheonphil.or.kr/upload/ckeditor/1793770401025.png' });
    expect(detail.images[6].url).toBe('https://www.bucheonphil.or.kr/upload/ckeditor/1793770454709.png');
    expect(detail.attachments).toEqual([
      { name: '부천시립합창단_상임단원 채용 공고.zip', ext: 'zip', url: 'https://www.bucheonphil.or.kr/file/download.do?fileId=FS018179' },
    ]);
  });

  it('단원채용 상세: 안내 줄 + 본문, 첨부 크기 표시는 뗀다', () => {
    const detail = parseBucheonNoticeDetail(fixture('recruit-detail-RM000035.html'));
    expect(detail.title).toBe('부천시립합창단 단원 채용');
    expect(detail.registeredAt).toBe('2026-06-01');
    expect(detail.images).toEqual([]);
    expect(detail.attachments).toEqual([
      { name: '합창단 상임단원 채용 공고문.zip', ext: 'zip', url: 'https://www.bucheonphil.or.kr/file/download.do?fileId=FS017927' },
    ]);
    const lines = detail.bodyText.split('\n');
    expect(lines.slice(0, 4)).toEqual([
      '접수기간: 2026-06-01 09:00 ~ 2026-06-10 17:00',
      '발표일자: 2026-07-09',
      '채용문의: 전화 070-4124-6991 이메일 bucheonaudition@naver.com',
      '',
    ]);
    expect(lines[4]).toBe('부천시 공고 제2026-1459호');
    expect(detail.bodyText).toContain('■ 채용분야 및 인원 : 베이스 상임단원 1명');
    expect(detail.bodyText).toContain('- 파일명 : 베이스_성명 (예. 베이스_홍길동)');
    expect(detail.bodyText.endsWith('최종제출 후에는 응시번호가 부여되어 수정이 불가능함.')).toBe(true);
  });
});

describe('pickBucheonNoticeDocument / pickBucheonNoticeZip', () => {
  const file = (name: string) => ({ name, ext: name.slice(name.lastIndexOf('.') + 1).toLowerCase() });

  it("'공고' 든 HWP → '공고' 든 PDF → 서식·지정곡이 아닌 HWP → PDF", () => {
    expect(
      pickBucheonNoticeDocument([file('응시원서(서식).hwpx'), file('부천시립합창단 상임단원 채용 공고문.pdf'), file('단원채용_공통지정곡.pdf')])?.name,
    ).toBe('부천시립합창단 상임단원 채용 공고문.pdf');
    expect(pickBucheonNoticeDocument([file('채용 공고문.pdf'), file('채용 공고.hwp')])?.name).toBe('채용 공고.hwp');
    expect(pickBucheonNoticeDocument([file('안내문.pdf'), file('모집 요강.hwpx')])?.name).toBe('모집 요강.hwpx');
    expect(pickBucheonNoticeDocument([file('안내문.pdf'), file('채용 공고.pdf')])?.name).toBe('채용 공고.pdf');
  });

  it('서식·지정곡·zip·이미지만 있으면 고르지 않는다', () => {
    expect(pickBucheonNoticeDocument([file('응시원서(서식).hwpx'), file('지정곡.pdf'), file('공고.zip'), file('공고.png')])).toBeUndefined();
    expect(pickBucheonNoticeDocument([])).toBeUndefined();
  });

  it("ZIP 은 '공고' 든 것 우선, 없으면 첫 ZIP", () => {
    expect(pickBucheonNoticeZip([file('지정곡.zip'), file('채용 공고.zip'), file('공고.hwp')])?.name).toBe('채용 공고.zip');
    expect(pickBucheonNoticeZip([file('a.zip'), file('b.zip')])?.name).toBe('a.zip');
    expect(pickBucheonNoticeZip([file('공고.hwp')])).toBeUndefined();
  });

  it('fileNameAndExt 는 경로의 마지막 조각과 소문자 확장자', () => {
    expect(fileNameAndExt('지정곡/부천시립합창단 지정곡.PDF')).toEqual({ name: '부천시립합창단 지정곡.PDF', ext: 'pdf' });
    expect(fileNameAndExt('README')).toEqual({ name: 'README', ext: '' });
  });
});
