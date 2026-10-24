import * as fs from 'fs';
import * as path from 'path';
import { parseUlsanNoticeDetail, parseUlsanNoticeList, pickUlsanNoticeAttachment } from './ulsan-notice.parser';

/**
 * 스펙 (실제 페이지 픽스처, 2026-10-06 기준):
 * 1) 목록 1페이지는 고정 공지 5건 + 일반 10건 = 15행. 고정 공지는 pinned, 번호·제목·작성자·등록일·URL 을 읽는다
 * 2) 상세: 제목 · 본문(줄바꿈 유지, &nbsp; 는 공백) · 첨부 3개(hwp · pdf · 서식 hwp) 의 이름·확장자·다운로드 URL
 * 3) 공고문 고르기: '공고' 가 든 HWP 우선 → HWP 없으면 PDF → 서식 파일은 뒤로
 */
const fixture = (name: string) => fs.readFileSync(path.join(__dirname, '__fixtures__', name), 'utf8');

describe('parseUlsanNoticeList', () => {
  it('고정 공지와 일반 글을 모두 읽고 고정 공지는 pinned 로 표시한다', () => {
    const rows = parseUlsanNoticeList(fixture('list-2026-10-06-p1.html'), 'mnu003001');
    expect(rows).toHaveLength(15);
    expect(rows.filter(r => r.pinned)).toHaveLength(5);
    expect(rows[0]).toEqual({
      bodSn: '235',
      title: '2027년 상반기 울산문화예술회관 정기대관 공고',
      writer: '대관담당자',
      registeredAt: '2026-08-21',
      pinned: true,
      url: 'https://www.ulsan.go.kr/ucac/art/page.do?mnu_code=mnu003001&bod_sn=235&cmd=2',
    });
    expect(rows[5]).toEqual({
      bodSn: '163',
      title: '울산시립교향악단 수·차석단원 공개모집 변경 공고',
      writer: '시립예술단 담당자',
      registeredAt: '2026-10-06',
      pinned: false,
      url: 'https://www.ulsan.go.kr/ucac/art/page.do?mnu_code=mnu003001&bod_sn=163&cmd=2',
    });
    expect(rows.filter(r => r.registeredAt === '2026-10-06').map(r => r.bodSn)).toEqual(['163', '225', '267', '268', '269']);
    expect(rows[14]).toMatchObject({ bodSn: '222', registeredAt: '2026-07-30', pinned: false });
  });

  it('2페이지에도 같은 고정 공지가 반복된다', () => {
    const rows = parseUlsanNoticeList(fixture('list-2026-10-06-p2.html'), 'mnu003001');
    expect(rows).toHaveLength(15);
    expect(rows.filter(r => r.pinned).map(r => r.bodSn)).toEqual(['235', '227', '217', '175', '20']);
    expect(rows.filter(r => !r.pinned).map(r => r.registeredAt)[0]).toBe('2026-07-24');
  });
});

describe('parseUlsanNoticeDetail', () => {
  const detail = parseUlsanNoticeDetail(fixture('detail-163.html'));

  it('제목·본문·첨부를 읽는다', () => {
    expect(detail.title).toBe('울산시립교향악단 수·차석단원 공개모집 변경 공고');
    const lines = detail.bodyText.split('\n');
    expect(lines[0]).toBe('울산시립교향악단 수·차석단원 모집을 다음과 같이 변경 공고합니다.');
    expect(lines).toContain('○ 모집인원(10명)');
    expect(lines).toContain('- 수석단원(4명) : 트럼펫, 트롬본, 바순, 클라리넷');
    expect(lines).toContain('- 차석단원(6명) : 트럼펫, 트롬본, 바순, 비올라, 호른, 타악기');
    expect(detail.bodyText.endsWith('2026년 4월 10일\n울 산 광 역 시 장')).toBe(true);
    expect(detail.bodyText).not.toContain(' ');
    expect(detail.attachments).toEqual([
      {
        name: '울산광역시문화예술회관 공고_울산시립교향악단 수차석단원 공개모집(변경).hwp',
        ext: 'hwp',
        url: 'https://www.ulsan.go.kr/ucac/board_download.do?mnu_code=mnu003001&bod_sn=163&file_sn=82',
      },
      {
        name: '울산광역시문화예술회관 공고_울산시립교향악단 수차석단원 공개모집(변경).pdf',
        ext: 'pdf',
        url: 'https://www.ulsan.go.kr/ucac/board_download.do?mnu_code=mnu003001&bod_sn=163&file_sn=83',
      },
      { name: '응시서류 서식.hwp', ext: 'hwp', url: 'https://www.ulsan.go.kr/ucac/board_download.do?mnu_code=mnu003001&bod_sn=163&file_sn=84' },
    ]);
  });

  it('공고문은 공고 가 든 HWP 를 고른다', () => {
    expect(pickUlsanNoticeAttachment(detail.attachments)?.name).toBe('울산광역시문화예술회관 공고_울산시립교향악단 수차석단원 공개모집(변경).hwp');
  });
});

describe('pickUlsanNoticeAttachment', () => {
  const att = (name: string) => ({ name, ext: name.slice(name.lastIndexOf('.') + 1).toLowerCase(), url: `https://x/${name}` });

  it('HWP 가 없으면 PDF 를 고른다', () => {
    expect(pickUlsanNoticeAttachment([att('응시서류 서식.docx'), att('모집 공고.pdf')])?.name).toBe('모집 공고.pdf');
  });

  it('서식 파일만 HWP 이고 공고문이 PDF 여도 HWP 를 먼저 쓴다 (목포와 같은 규칙)', () => {
    expect(pickUlsanNoticeAttachment([att('응시서류 서식.hwp'), att('모집 공고.pdf')])?.name).toBe('응시서류 서식.hwp');
  });

  it('공고 낱말이 없으면 서식이 아닌 HWP 를 먼저 고른다', () => {
    expect(pickUlsanNoticeAttachment([att('지원서.hwp'), att('단원 모집 안내.hwp')])?.name).toBe('단원 모집 안내.hwp');
  });

  it('문서 첨부가 없으면 undefined', () => {
    expect(pickUlsanNoticeAttachment([att('포스터.jpg')])).toBeUndefined();
  });
});
