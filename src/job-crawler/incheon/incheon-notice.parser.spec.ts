import * as fs from 'fs';
import * as path from 'path';
import { parseIncheonNoticeDetail, parseIncheonNoticeList, pickIncheonNoticeAttachment } from './incheon-notice.parser';

/**
 * 스펙 (실제 페이지 픽스처, 2026-11-10 기준 인천문화예술회관 채용/공모):
 * 1) 목록 1페이지는 고정 공지 4건 + 일반 10건 = 14행. 고정 공지는 pinned, 제목의 '공지' 배지는 뗀다. id·제목·부서·작성일·URL 을 읽는다
 * 2) 2페이지는 일반 10건만 (고정 공지는 1페이지에만 나온다)
 * 3) 상세: 제목 · 담당부서 · 작성일 · 본문(문단 사이 빈 줄 하나, &nbsp; 는 공백) · 첨부 2개(hwpx 공고문 · pdf 지정곡) 의 이름·확장자·다운로드 URL
 * 4) 공고문 고르기: '공고' 가 든 HWP/HWPX → HWP 없으면 악보가 아닌 PDF → 악보 PDF 만 있으면 그것 → zip 은 고르지 않는다
 */
const fixture = (name: string) => fs.readFileSync(path.join(__dirname, '__fixtures__', name), 'utf8');

describe('parseIncheonNoticeList', () => {
  it('고정 공지와 일반 글을 모두 읽고 고정 공지는 pinned 로 표시한다', () => {
    const rows = parseIncheonNoticeList(fixture('list-2026-11-10-p1.html'));
    expect(rows).toHaveLength(14);
    expect(rows.filter(r => r.pinned)).toHaveLength(4);
    expect(rows[0]).toEqual({
      id: '3094311',
      title: '2027 인천시립교향악단 및 청소년교향악단 신규단원 공개모집 공고',
      department: '문화예술회관',
      registeredAt: '2026-11-10',
      pinned: true,
      url: 'https://www.incheon.go.kr/art/ART040102/3094311',
    });
    expect(rows[3]).toEqual({
      id: '3089481',
      title: '인천시립청소년교향악단 마스터클래스 참가자 및 청강자 모집 공고',
      department: '인천시립교향악단',
      registeredAt: '2026-09-30',
      pinned: true,
      url: 'https://www.incheon.go.kr/art/ART040102/3089481',
    });
    expect(rows[4]).toEqual({
      id: '3088294',
      title: '2026년도 인천광역시 공무직 채용 공고(의상실 관리, 예술단 의상 대여 및 수선 담당)',
      department: '문화예술회관',
      registeredAt: '2026-09-17',
      pinned: false,
      url: 'https://www.incheon.go.kr/art/ART040102/3088294',
    });
    expect(rows.filter(r => !r.pinned).map(r => r.registeredAt)).toEqual([
      '2026-09-17',
      '2026-08-05',
      '2026-07-31',
      '2026-07-29',
      '2026-07-24',
      '2026-07-22',
      '2026-07-14',
      '2026-07-14',
      '2026-07-14',
      '2026-07-07',
    ]);
  });

  it('2페이지는 일반 글만 있다', () => {
    const rows = parseIncheonNoticeList(fixture('list-2026-11-10-p2.html'));
    expect(rows).toHaveLength(10);
    expect(rows.every(r => !r.pinned)).toBe(true);
    expect(rows[0]).toMatchObject({ id: '3079730', title: '2026 인천시립무용단 출연단원 공개모집 1차 실기전형 공고', registeredAt: '2026-07-03' });
    expect(rows[8]).toMatchObject({ id: '3074044', title: '2026 인천시립교향악단 기간제 비상임단원 공개모집 1차 실기전형 공고', registeredAt: '2026-05-28' });
  });

  it('표가 없으면 빈 배열', () => {
    expect(parseIncheonNoticeList('<html><body>점검 중</body></html>')).toEqual([]);
  });
});

describe('parseIncheonNoticeDetail', () => {
  it('제목·부서·작성일·본문·첨부를 읽는다', () => {
    const detail = parseIncheonNoticeDetail(fixture('detail-3094311.html'));
    expect(detail.title).toBe('2027 인천시립교향악단 및 청소년교향악단 신규단원 공개모집 공고');
    expect(detail.department).toBe('문화예술회관 (032-420-2742)');
    expect(detail.registeredAt).toBe('2026-11-10');
    expect(detail.bodyText).toBe(
      [
        '인천시립교향악단 출연단원 및 청소년교향악단 기획운영단원을 다음과 같이 공개모집하오니 유능한 인재들의 많은 관심과 참여 바랍니다.',
        '',
        '2026. 11. 10.',
        '',
        '인천광역시문화예술회관장',
        '',
        '*자세한 사항 및 서식, 지정곡 악보 : 첨부파일 참조',
      ].join('\n'),
    );
    expect(detail.attachments).toEqual([
      {
        name: '2027 인천시립교향악단 출연단원 및 청소년교향악단 기획운영단원 공개모집 공고.hwpx',
        ext: 'hwpx',
        url: 'https://www.incheon.go.kr/comm/getFile?srvcId=BBSTY1&upperNo=3094311&fileTy=ATTACH&fileNo=1',
      },
      {
        name: 'Utility Trombone_Excerpts.pdf',
        ext: 'pdf',
        url: 'https://www.incheon.go.kr/comm/getFile?srvcId=BBSTY1&upperNo=3094311&fileTy=ATTACH&fileNo=2',
      },
    ]);
  });
});

describe('pickIncheonNoticeAttachment', () => {
  const att = (name: string) => ({
    name,
    ext: name.slice(name.lastIndexOf('.') + 1).toLowerCase(),
    url: `https://www.incheon.go.kr/comm/getFile?fileNo=${name}`,
  });

  it("'공고' 가 든 HWPX 를 악보 PDF 보다 먼저 고른다", () => {
    const picked = pickIncheonNoticeAttachment([att('Utility Trombone_Excerpts.pdf'), att('2027 인천시립교향악단 공개모집 공고.hwpx')]);
    expect(picked?.name).toBe('2027 인천시립교향악단 공개모집 공고.hwpx');
  });

  it('HWP 가 없으면 악보가 아닌 PDF, 그것도 없으면 첫 PDF', () => {
    expect(pickIncheonNoticeAttachment([att('지정곡 악보.pdf'), att('모집요강.pdf')])?.name).toBe('모집요강.pdf');
    expect(pickIncheonNoticeAttachment([att('Violin_Excerpts.pdf')])?.name).toBe('Violin_Excerpts.pdf');
  });

  it('서식 HWP 와 공고 HWP 가 같이 있으면 공고, zip·이미지만 있으면 고르지 않는다', () => {
    expect(pickIncheonNoticeAttachment([att('응시원서 서식.hwp'), att('단원 모집 공고문.hwp')])?.name).toBe('단원 모집 공고문.hwp');
    expect(pickIncheonNoticeAttachment([att('지정곡.zip'), att('포스터.jpg')])).toBeUndefined();
  });
});
