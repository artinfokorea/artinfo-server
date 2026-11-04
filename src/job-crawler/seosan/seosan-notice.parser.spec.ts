import * as fs from 'fs';
import * as path from 'path';
import { parseSeosanNoticeDetail, parseSeosanNoticeList, pickSeosanNoticeAttachment, seosanDetailUrl } from './seosan-notice.parser';

/**
 * 스펙 (실제 페이지 픽스처, 서산시 채용공고 — eminwon iframe):
 * 1) 목록 1페이지 10행: 번호 · 고시공고번호 · 제목 · 담당부서 · 등록일 · 조회수, 행마다 searchDetail('관리번호'). 고정 공지는 없다
 * 2) 2페이지도 10행, 등록일 내림차순이 이어진다
 * 3) '시립합창단' 검색 결과 페이지: 9행, 단원 모집 공고(60500) 의 제목·부서·등록일
 * 4) 상세: 제목 · 고시공고번호 · 등록일 · 담당부서 · 본문(&nbsp; 는 공백, <br> 은 줄바꿈) · 첨부 7개(hwp 1 · pdf 3 · jpg 3) 의 이름·확장자·다운로드 URL(encodeURIComponent)
 * 5) 공고문 고르기: HWP/HWPX 우선 → 없으면 '악보' 가 아닌 PDF → 이미지는 고르지 않는다
 */
const fixture = (name: string) => fs.readFileSync(path.join(__dirname, '__fixtures__', name), 'utf8');
const detailUrl = (no: string) =>
  `https://www.seosan.go.kr/common/program/eminwonView.jsp?jndinm=OfrNotAncmtEJB&context=NTIS&method=selectOfrNotAncmt&methodnm=selectOfrNotAncmtRegst&homepage_pbs_yn=Y&subCheck=Y&not_ancmt_se_code=05&not_ancmt_mgt_no=${no}`;

describe('seosanDetailUrl', () => {
  it('관리번호로 상세 URL 을 만든다 (jndinm·context·homepage_pbs_yn·subCheck 가 없으면 500)', () => {
    expect(seosanDetailUrl('60500')).toBe(detailUrl('60500'));
  });
});

describe('parseSeosanNoticeList', () => {
  it('1페이지 10행의 관리번호·고시공고번호·제목·부서·등록일·URL 을 읽는다', () => {
    const rows = parseSeosanNoticeList(fixture('list-2026-11-04-p1.html'));
    expect(rows).toHaveLength(10);
    expect(rows[0]).toEqual({
      mgtNo: '65949',
      noticeNo: '서산시 해미면 공고 제2026-35호',
      title: '2026년 해미면 공중화장실 관리인 추가 채용 공고',
      department: '해미면',
      registeredAt: '2026-11-04',
      url: detailUrl('65949'),
    });
    expect(rows.map(r => r.mgtNo)).toEqual(['65949', '65937', '65926', '65879', '65870', '65798', '65829', '65827', '65790', '65782']);
    expect(rows.map(r => r.registeredAt)).toEqual([
      '2026-11-04',
      '2026-11-03',
      '2026-11-02',
      '2026-10-29',
      '2026-10-28',
      '2026-10-26',
      '2026-10-23',
      '2026-10-23',
      '2026-10-22',
      '2026-10-21',
    ]);
  });

  it('2페이지도 10행이고 등록일이 이어서 내려간다', () => {
    const rows = parseSeosanNoticeList(fixture('list-2026-11-04-p2.html'));
    expect(rows).toHaveLength(10);
    expect(rows[0]).toMatchObject({ mgtNo: '65764', title: '2026년 서산시 보건소 시니어 의사 채용 재공고', registeredAt: '2026-10-20' });
    expect(rows[9]).toMatchObject({ mgtNo: '65643', registeredAt: '2026-10-06' });
  });

  it('시립합창단 검색 결과: 단원 모집 공고 행', () => {
    const rows = parseSeosanNoticeList(fixture('list-choir-search.html'));
    expect(rows).toHaveLength(9);
    expect(rows[1]).toEqual({
      mgtNo: '60500',
      noticeNo: '서산시 공고 제2025-2239호',
      title: '서산시 시립합창단 단원 모집 공고',
      department: '문화예술과',
      registeredAt: '2025-09-05',
      url: detailUrl('60500'),
    });
  });

  it('표가 없으면 빈 배열', () => {
    expect(parseSeosanNoticeList('<html><body></body></html>')).toEqual([]);
  });
});

describe('parseSeosanNoticeDetail', () => {
  const detail = parseSeosanNoticeDetail(fixture('detail-60500.html'));

  it('제목·고시공고번호·등록일·담당부서', () => {
    expect(detail.title).toBe('서산시 시립합창단 단원 모집 공고');
    expect(detail.noticeNo).toBe('서산시 공고 제2025-2239호');
    expect(detail.registeredAt).toBe('2025-09-05');
    expect(detail.department).toBe('문화예술과');
  });

  it('본문은 &nbsp; 를 공백으로, <br> 을 줄바꿈으로 읽는다', () => {
    const lines = detail.bodyText.split('\n');
    expect(lines[0]).toBe(
      '서산시에서는 시민의 정서 함양과 지역문화예술 발전을 위하여 서산시립합창단을 이끌어갈 참신하고 능력있는단원을 모집하오니, 많은 관심과 참여 바랍니다.',
    );
    expect(lines[lines.length - 1]).toBe('5. 접 수 처: 서산시청 문화예술과 문예지원팀(충남 서산시 관아문길 1 서산시청 문화예술과)');
    expect(detail.bodyText).toContain('3. 접수기간: 2025. 9. 8.(월) ~ 9. 22.(월), 14일간');
  });

  it('첨부 7개의 이름·확장자·다운로드 URL', () => {
    expect(detail.attachments).toHaveLength(7);
    expect(detail.attachments[0]).toEqual({
      name: '서산시 시립합창단 단원 모집 공고.hwp',
      ext: 'hwp',
      sysFileName: '서산시 시립합창단 단원 모집 공고_ofr_ofr_cwZzmAFUF2ApwwAr_20250905095642179_1.hwp',
      filePath: '/ntishome/file/upload/ofr/ofr/20250905',
      url: 'https://eminwon.seosan.go.kr/emwp/jsp/ofr/FileDown.jsp?user_file_nm=%EC%84%9C%EC%82%B0%EC%8B%9C%20%EC%8B%9C%EB%A6%BD%ED%95%A9%EC%B0%BD%EB%8B%A8%20%EB%8B%A8%EC%9B%90%20%EB%AA%A8%EC%A7%91%20%EA%B3%B5%EA%B3%A0.hwp&sys_file_nm=%EC%84%9C%EC%82%B0%EC%8B%9C%20%EC%8B%9C%EB%A6%BD%ED%95%A9%EC%B0%BD%EB%8B%A8%20%EB%8B%A8%EC%9B%90%20%EB%AA%A8%EC%A7%91%20%EA%B3%B5%EA%B3%A0_ofr_ofr_cwZzmAFUF2ApwwAr_20250905095642179_1.hwp&file_path=%2Fntishome%2Ffile%2Fupload%2Fofr%2Fofr%2F20250905',
    });
    expect(detail.attachments.map(a => a.ext)).toEqual(['hwp', 'pdf', 'pdf', 'pdf', 'jpg', 'jpg', 'jpg']);
    expect(detail.attachments[4].name).toBe('2차 지정곡 악보(베이스).jpg');
  });
});

describe('pickSeosanNoticeAttachment', () => {
  const detail = parseSeosanNoticeDetail(fixture('detail-60500.html'));
  const att = (name: string, ext: string) => ({ name, ext, sysFileName: 's', filePath: '/p', url: 'u' });

  it('실제 상세에서는 공고문 hwp 를 고른다 (악보 pdf·jpg 가 아니라)', () => {
    expect(pickSeosanNoticeAttachment(detail.attachments)?.name).toBe('서산시 시립합창단 단원 모집 공고.hwp');
  });

  it("HWP/HWPX 가 여럿이면 '공고' 가 든 것 → 서식이 아닌 것 → 첫 것", () => {
    expect(pickSeosanNoticeAttachment([att('응시원서.hwp', 'hwp'), att('모집 공고문.hwpx', 'hwpx')])?.name).toBe('모집 공고문.hwpx');
    expect(pickSeosanNoticeAttachment([att('응시원서 서식.hwp', 'hwp'), att('안내.hwp', 'hwp')])?.name).toBe('안내.hwp');
    expect(pickSeosanNoticeAttachment([att('응시원서 서식.hwp', 'hwp')])?.name).toBe('응시원서 서식.hwp');
  });

  it("HWP 가 없으면 '악보' 가 아닌 PDF, 그것도 없으면 undefined", () => {
    expect(pickSeosanNoticeAttachment([att('지정곡 악보.pdf', 'pdf'), att('모집 공고.pdf', 'pdf')])?.name).toBe('모집 공고.pdf');
    expect(pickSeosanNoticeAttachment([att('지정곡 악보.pdf', 'pdf'), att('악보.jpg', 'jpg')])).toBeUndefined();
    expect(pickSeosanNoticeAttachment([])).toBeUndefined();
  });
});
