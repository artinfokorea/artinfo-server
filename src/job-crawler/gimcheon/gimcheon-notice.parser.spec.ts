import * as fs from 'fs';
import * as path from 'path';
import { parseGimcheonNoticeDetail, parseGimcheonNoticeList, pickGimcheonNoticeAttachment } from './gimcheon-notice.parser';

/**
 * 스펙 (실제 페이지 픽스처, 2026-11-12 기준 김천시문화예술회관 공지사항):
 * 1) 목록 1페이지는 일반 글 10행 (고정 공지 없음). bIdx·제목·부서·작성일·상세 URL 을 읽고 작성일 내림차순이다
 * 2) 2페이지도 일반 10행
 * 3) 상세: 제목 · 작성자 · 등록일("등록일 : " 접두 제거) · 본문(문단 사이 빈 줄 하나) · 첨부 1개(hwpx 공고문) 의 이름·확장자·다운로드 URL
 * 4) 공고문 고르기: '공고' 가 든 HWP/HWPX → HWP 없으면 악보가 아닌 PDF → zip·이미지는 고르지 않는다
 */
const fixture = (name: string) => fs.readFileSync(path.join(__dirname, '__fixtures__', name), 'utf8');

describe('parseGimcheonNoticeList', () => {
  it('목록 1페이지의 일반 글 10행을 읽는다', () => {
    const rows = parseGimcheonNoticeList(fixture('list-2026-11-12-p1.html'));
    expect(rows).toHaveLength(10);
    expect(rows.every(r => !r.pinned && r.hasFile)).toBe(true);
    expect(rows[0]).toEqual({
      id: '4544687',
      title: '2026년 김천시립예술단 지휘자(비상임) 모집 공고',
      department: '문화예술회관',
      registeredAt: '2026-11-11',
      pinned: false,
      hasFile: true,
      url: 'https://www.gc.go.kr/gcart/bbs/view.do?bIdx=4544687&ptIdx=1807&mId=0601000000',
    });
    expect(rows[2]).toMatchObject({ id: '4520443', title: '2026년 김천시립예술단(비상임) 신규단원 모집 최종합격자 공고', registeredAt: '2026-02-19' });
    expect(rows[3]).toMatchObject({ id: '4519144', title: '2026년 김천시립예술단원(비상임) 모집 공고', registeredAt: '2026-01-15' });
    expect(rows.map(r => r.registeredAt)).toEqual([
      '2026-11-11',
      '2026-05-12',
      '2026-02-19',
      '2026-01-15',
      '2025-08-04',
      '2025-06-18',
      '2025-04-04',
      '2025-03-19',
      '2025-02-26',
      '2025-01-24',
    ]);
  });

  it('2페이지도 일반 글 10행이다', () => {
    const rows = parseGimcheonNoticeList(fixture('list-2026-11-12-p2.html'));
    expect(rows).toHaveLength(10);
    expect(rows[0]).toMatchObject({ id: '4506367', title: '2025년 예술아카데미 수강생 모집 공고', registeredAt: '2025-01-20' });
    expect(rows[3]).toMatchObject({ id: '4504242', title: '2024년 김천시립예술단 지휘자(비상임) 모집 공고', registeredAt: '2024-11-11' });
    expect(rows[7]).toMatchObject({ id: '4498259', title: '2024 시립예술단(비상임) 신규 단원(국악단, 합창단) 모집 공고', registeredAt: '2024-04-11' });
  });

  it('표가 없으면 빈 배열', () => {
    expect(parseGimcheonNoticeList('<html><body>점검 중</body></html>')).toEqual([]);
  });
});

describe('parseGimcheonNoticeDetail', () => {
  it('제목·작성자·등록일·본문·첨부를 읽는다', () => {
    const detail = parseGimcheonNoticeDetail(fixture('detail-4544687.html'));
    expect(detail.title).toBe('2026년 김천시립예술단 지휘자(비상임) 모집 공고');
    expect(detail.department).toBe('문화예술회관');
    expect(detail.registeredAt).toBe('2026-11-11');
    expect(detail.bodyText).toBe(
      [
        '2026년 김천시립예술단 지휘자(비상임) 모집 공고',
        '',
        '1. 접수기간 : 2026. 11. 23.(월) ~ 11. 26.(목) (4일간)',
        '',
        '2. 교부 및 접수처 : 김천시문화예술회관 1층 사무실',
        '',
        '3. 접수방법 : 방문접수 및 우편접수',
        '',
        '4. 문의전화 : 054-420-7827',
        '',
        '5. 기타사항 : 붙임 참조',
        '',
        '붙임 2026년 김천시립예술단 지휘자(비상임) 모집 공고문 1부. 끝.',
      ].join('\n'),
    );
    expect(detail.attachments).toEqual([
      {
        name: '공고문(2026 김천시립예술단 지휘자(비상임) 모집).hwpx',
        ext: 'hwpx',
        url: 'https://www.gc.go.kr/cmm/fms/FileDown.do?atchFileId=6ba02925622075af54899407c3199260ccf29f6ba9366bf5adbf2e01639fdd9a&fileSn=f9a1967c526603d17ab488b9d2747cda',
      },
    ]);
  });
});

describe('pickGimcheonNoticeAttachment', () => {
  const att = (name: string) => ({
    name,
    ext: name.slice(name.lastIndexOf('.') + 1).toLowerCase(),
    url: `https://www.gc.go.kr/cmm/fms/FileDown.do?fileSn=${name}`,
  });

  it("'공고' 가 든 HWPX 를 PDF 보다 먼저 고른다", () => {
    expect(pickGimcheonNoticeAttachment([att('지정곡.pdf'), att('공고문(2026 모집).hwpx')])?.name).toBe('공고문(2026 모집).hwpx');
  });

  it('HWP 가 없으면 악보가 아닌 PDF, 그것도 없으면 첫 PDF', () => {
    expect(pickGimcheonNoticeAttachment([att('지정곡 악보.pdf'), att('모집요강.pdf')])?.name).toBe('모집요강.pdf');
    expect(pickGimcheonNoticeAttachment([att('Violin_Excerpts.pdf')])?.name).toBe('Violin_Excerpts.pdf');
  });

  it('서식 HWP 와 공고 HWP 가 같이 있으면 공고, zip·이미지만 있으면 고르지 않는다', () => {
    expect(pickGimcheonNoticeAttachment([att('응시원서 서식.hwp'), att('단원 모집 공고문.hwp')])?.name).toBe('단원 모집 공고문.hwp');
    expect(pickGimcheonNoticeAttachment([att('지정곡.zip'), att('포스터.jpg')])).toBeUndefined();
  });
});
