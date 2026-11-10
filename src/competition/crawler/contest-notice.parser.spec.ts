import * as fs from 'fs';
import * as path from 'path';
import { inferAges, inferDivisions, isCompetitionTitle, parseContestDetail, parseContestList, toIsoDate } from './contest-notice.parser';

/**
 * 스펙 (실제 페이지 픽스처, 2026-11-11 contest.co.kr 음악경연 전체 목록·상세 23151)
 * 1) 목록 50행: id·원문 URL·제목·주최·지역 배지·분류 배지(추천/인기 제외)·상태(접수중/접수예정/심사대기/심사중)
 * 2) 상세: 제목, 대회기간 → 대회일, 접수기간 "2026.11.01 ~ 2026.11.25 23시59분" → 시작·마감, 지역 [경기] → 경기, 장소·주관·전화·이메일·포스터·관리자 알림
 * 3) 제목 판정: 콩쿠르·콩쿨·경연·Competition·콘테스트·예술제는 대상, 평가회·마스터클래스·모의평가·신청서는 제외
 * 4) 부문·대상 추출: 제목(+분류)에서 피아노·성악·현악·관악·작곡·실용음악, 없으면 종합. 청소년/영재는 초·중·고
 */
const fixture = (name: string) => fs.readFileSync(path.join(__dirname, '__fixtures__', name), 'utf8');

describe('parseContestList', () => {
  const rows = parseContestList(fixture('list-2026-11-11.html'));

  it('50행을 읽는다', () => {
    expect(rows).toHaveLength(50);
    expect(rows[0]).toEqual({
      id: '22917',
      url: 'https://contest.co.kr/contest/view1/22917',
      title: '제30회 세종오케스트라국제음악콩쿠르',
      host: '재단법인) 세종국제예술문화재단',
      area: '서울',
      categories: ['클래식/실용'],
      state: '접수중',
    });
  });

  it('상태·지역·분류 배지를 구분한다', () => {
    const byId = Object.fromEntries(rows.map(r => [r.id, r]));
    expect(byId['22791']).toMatchObject({ title: '2026 Asia Young Musicians Competition', state: '심사대기', area: '서울' });
    expect(byId['23085']).toMatchObject({ state: '접수예정', area: '제주' });
    expect(byId['22690']).toMatchObject({ state: '심사중' });
    expect(byId['23142']).toMatchObject({ area: '서울', categories: ['성악'] });
    expect(byId['23153']).toMatchObject({ area: '전국', host: '한경국립대학교 / 실용음악학전공' });
  });
});

describe('parseContestDetail', () => {
  it('상세 필드를 읽는다', () => {
    expect(parseContestDetail(fixture('detail-23151.html'))).toEqual({
      title: '제13회 수원시전국음악콩쿠르',
      heldAt: '2026-11-28',
      openAt: '2026-11-01',
      closeAt: '2026-11-25',
      area: '경기',
      venue: '수원문화원 빛누리아트홀',
      organizer: '(사)한국음악협회 수원시지부',
      tel: '010-5261-8125',
      email: 'nartec@naver.com',
      posterUrl: 'https://contest.co.kr/data/media/image/contest/202611/imgm_20261107122317400.jpg',
      notice: '본 대회는 주최측 홈페이지에서 접수가 가능합니다.',
    });
  });

  it('toIsoDate — 두 자리 연도·한 자리 월일도 받는다', () => {
    expect(toIsoDate('26.11.02 ~ 26.12.27')).toBe('2026-11-02');
    expect(toIsoDate('2026.1.5')).toBe('2026-01-05');
    expect(toIsoDate('없음')).toBeNull();
  });
});

describe('isCompetitionTitle', () => {
  it('콩쿠르·경연은 대상, 평가회·클래스·모의평가는 제외', () => {
    expect(isCompetitionTitle('제30회 세종오케스트라국제음악콩쿠르')).toBe(true);
    expect(isCompetitionTitle('쇼팽음악영재콩쿨')).toBe(true);
    expect(isCompetitionTitle('2026년(제6회) 충남 아마추어 색소폰 경연대회')).toBe(true);
    expect(isCompetitionTitle('2026 Asia Young Musicians Competition')).toBe(true);
    expect(isCompetitionTitle('제 14회  전국서석 예술제')).toBe(true);
    expect(isCompetitionTitle('2027 안톤 피아노·현악 입시평가회 (11/22 추가회차)')).toBe(false);
    expect(isCompetitionTitle('vmp 피아노 마스터 클래스')).toBe(false);
    expect(isCompetitionTitle('음악입시모의평가')).toBe(false);
    expect(isCompetitionTitle('2026 11월 SC BRIGHT 코멘트 입시평가회 신청서')).toBe(false);
    expect(isCompetitionTitle('2027학년도 전기 세종대학교 융합예술대학원 음악학과 신입생 모집')).toBe(false);
  });
});

describe('inferDivisions / inferAges', () => {
  it('부문', () => {
    expect(inferDivisions('제9회 숭실음악콩쿠르 피아노 부문')).toEqual(['피아노']);
    expect(inferDivisions('2026 한국가창지도지협회 전국성악콩쿨', ['성악'])).toEqual(['성악']);
    expect(inferDivisions('2027 안톤 피아노·현악 콩쿠르')).toEqual(['피아노', '현악']);
    expect(inferDivisions('충남 아마추어 색소폰 경연대회')).toEqual(['관악']);
    expect(inferDivisions('제4회 전국아트리동요대회')).toEqual(['실용음악']);
    expect(inferDivisions('제30회 세종오케스트라국제음악콩쿠르', ['클래식/실용'])).toEqual(['종합']);
  });
  it('대상', () => {
    expect(inferAges('서울뮤직청소년교육회 전국 청소년음악경연대회')).toEqual(['초등', '중등', '고등']);
    expect(inferAges('The 6th NN Arts 전국 입시생 성악 콩쿠르')).toEqual(['고등']);
    expect(inferAges('제4회 JICMF 아마추어 콩쿠르')).toEqual(['대학·일반']);
    expect(inferAges('제30회 세종오케스트라국제음악콩쿠르')).toEqual([]);
  });
});
