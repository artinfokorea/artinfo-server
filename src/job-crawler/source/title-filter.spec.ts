import { isRecruitmentTitle } from './title-filter';

/**
 * 스펙 (모든 소스 공통):
 * 1) 필수 낱말이 모두 있으면 대상 — 띄어쓰기 무시
 * 2) '합격' 이 들어가면 필수 낱말이 다 있어도 제외 (합격자 발표 · 최종합격 · 합 격)
 * 3) 필수 낱말이 하나라도 빠지면 제외
 * 4) 배열 항목은 그중 하나만 있으면 된다 — ['시립교향악단', ['모집', '채용']] 은 '공개모집' 도 '채용' 도 대상, 둘 다 없으면 제외
 */
const required = ['목포시립예술단', '채용'];

describe('isRecruitmentTitle', () => {
  it('필수 낱말이 모두 있으면 대상', () => {
    expect(isRecruitmentTitle('2026년도 목포시립예술단 단원 공개채용 공고', required)).toBe(true);
    expect(isRecruitmentTitle('목포시립 예술단 단원 채 용 공고', required)).toBe(true);
  });

  it("'합격' 이 들어가면 제외", () => {
    expect(isRecruitmentTitle('2026년도 목포시립예술단 단원 공개채용 합격자 발표', required)).toBe(false);
    expect(isRecruitmentTitle('목포시립예술단 단원 채용 최종합격 공고', required)).toBe(false);
    expect(isRecruitmentTitle('목포시립예술단 채용 합 격 자 명단', required)).toBe(false);
  });

  it('필수 낱말이 빠지면 제외', () => {
    expect(isRecruitmentTitle('목포시립예술단 정기연주회 안내', required)).toBe(false);
    expect(isRecruitmentTitle('2026년 시간선택제 임기제공무원 채용 공고', required)).toBe(false);
  });

  it('배열 항목은 그중 하나만 있으면 된다', () => {
    const ulsan = ['시립교향악단', ['모집', '채용']];
    expect(isRecruitmentTitle('울산시립교향악단 수·차석단원 공개모집 변경 공고', ulsan)).toBe(true);
    expect(isRecruitmentTitle('울산광역시립교향악단 단원 채용 공고', ulsan)).toBe(true);
    expect(isRecruitmentTitle('울산시립교향악단 제252회 정기연주회', ulsan)).toBe(false);
    expect(isRecruitmentTitle('2026년도 하반기 울산광역시립청소년교향악단 신규단원 모집 공고', ulsan)).toBe(false);
    expect(isRecruitmentTitle('울산광역시립교향악단 수·차석단원 공개모집 면접전형 합격자 공고(비올라, 타악기)', ulsan)).toBe(false);
  });
});
