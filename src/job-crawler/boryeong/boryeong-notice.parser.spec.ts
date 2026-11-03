import * as fs from 'fs';
import * as path from 'path';
import { parseBoryeongNoticeDetail, parseBoryeongNoticeList, pickBoryeongNoticeAttachment } from './boryeong-notice.parser';

/**
 * 스펙 (실제 페이지 픽스처, 2026-10-27 기준 보령문화예술회관 공지사항):
 * 1) 목록 1페이지는 고정 공지 5건 + 일반 10건 = 15행. 고정 공지는 pinned, nttId·제목·부서·등록일·URL 을 읽는다
 * 2) 2페이지는 고정 공지 5건만 반복되고 일반 글이 없다
 * 3) 상세: 제목 · 등록일 · 본문(줄바꿈 유지, &#40; 같은 엔티티는 풀어서) · 첨부 2개(hwpx · zip) 의 이름·확장자·다운로드 URL
 * 4) 공고문 고르기: '공고' 가 든 HWP/HWPX 우선 → HWP 없으면 PDF → zip 은 고르지 않는다
 */
const fixture = (name: string) => fs.readFileSync(path.join(__dirname, '__fixtures__', name), 'utf8');
const BBS = 'BBSMSTR_000000000983';

describe('parseBoryeongNoticeList', () => {
  it('고정 공지와 일반 글을 모두 읽고 고정 공지는 pinned 로 표시한다', () => {
    const rows = parseBoryeongNoticeList(fixture('list-2026-10-27-p1.html'), BBS);
    expect(rows).toHaveLength(15);
    expect(rows.filter(r => r.pinned)).toHaveLength(5);
    expect(rows[0]).toEqual({
      nttId: '197746',
      title: '보령문예회관 휠체어석 관련 안내',
      department: '문화교육과',
      registeredAt: '2026-08-06',
      pinned: true,
      url: 'https://www.brcn.go.kr/cop/bbs/BBSMSTR_000000000983/selectBoardArticle.do?bbsId=BBSMSTR_000000000983&nttId=197746',
    });
    expect(rows[5]).toEqual({
      nttId: '199082',
      title: '2026년 보령시립합창단 하반기 신규단원 모집',
      department: '문화교육과',
      registeredAt: '2026-10-27',
      pinned: false,
      url: 'https://www.brcn.go.kr/cop/bbs/BBSMSTR_000000000983/selectBoardArticle.do?bbsId=BBSMSTR_000000000983&nttId=199082',
    });
    expect(rows.filter(r => !r.pinned).map(r => r.registeredAt)).toEqual([
      '2026-10-27',
      '2025-11-14',
      '2024-11-18',
      '2024-11-18',
      '2024-03-22',
      '2023-11-28',
      '2023-11-28',
      '2023-11-20',
      '2023-04-28',
      '2023-03-23',
    ]);
    expect(rows[14]).toMatchObject({ nttId: '173833', title: '2023년 보령시립합창단(성인, 소년소녀) 신규단원 모집', pinned: false });
  });

  it('2페이지는 고정 공지만 반복되고 일반 글이 없다', () => {
    const rows = parseBoryeongNoticeList(fixture('list-2026-10-27-p2.html'), BBS);
    expect(rows).toHaveLength(5);
    expect(rows.every(r => r.pinned)).toBe(true);
    expect(rows.map(r => r.nttId)).toEqual(['197746', '197162', '192114', '191846', '191248']);
  });
});

describe('parseBoryeongNoticeDetail', () => {
  const detail = parseBoryeongNoticeDetail(fixture('detail-199082.html'));

  it('제목·등록일·본문·첨부를 읽는다', () => {
    expect(detail.title).toBe('2026년 보령시립합창단 하반기 신규단원 모집');
    expect(detail.registeredAt).toBe('2026-10-27');
    const lines = detail.bodyText.split('\n');
    expect(lines[0]).toBe(
      '음악을 사랑하고 지역문화 발전에 기여할 참신하고 성실한 보령시립합창단 신규단원을 모집하기 위해 붙임과 같이 누리집 및 게시판에 공고하고자 합니다.',
    );
    expect(lines).toContain('1. 모집인원: 21명');
    expect(lines).toContain('- 성 인: 예능(발성지도자) 1명, 수석(알토) 1명, 수석(테너) 1명, 일반 5명');
    expect(lines).toContain('- 소년소녀: 일반 13명');
    expect(detail.bodyText).not.toContain('<br');
    expect(detail.bodyText).not.toContain('&#');
    expect(detail.attachments).toEqual([
      {
        name: '2026년 보령시립합창단 하반기 신규단원 모집 공고(안).hwpx',
        ext: 'hwpx',
        url: 'https://www.brcn.go.kr/cmm/fms/FileDown.do?atchFileId=FILE_000000000176280&fileSn=0',
      },
      { name: '지정곡.zip', ext: 'zip', url: 'https://www.brcn.go.kr/cmm/fms/FileDown.do?atchFileId=FILE_000000000176280&fileSn=1' },
    ]);
  });

  it('공고문은 hwpx 를 고르고 zip 은 고르지 않는다', () => {
    expect(pickBoryeongNoticeAttachment(detail.attachments)?.name).toBe('2026년 보령시립합창단 하반기 신규단원 모집 공고(안).hwpx');
    expect(pickBoryeongNoticeAttachment([{ name: '지정곡.zip', ext: 'zip', url: 'u' }])).toBeUndefined();
    expect(
      pickBoryeongNoticeAttachment([
        { name: '지원서 서식.hwp', ext: 'hwp', url: 'a' },
        { name: '모집 공고.pdf', ext: 'pdf', url: 'b' },
      ])?.name,
    ).toBe('지원서 서식.hwp');
    expect(pickBoryeongNoticeAttachment([{ name: '모집 공고.pdf', ext: 'pdf', url: 'b' }])?.name).toBe('모집 공고.pdf');
  });
});
