import { MAJOR } from '@/job/entity/major-category.entity';
import { extractMajors } from './major-keyword';

/**
 * 스펙:
 * 1) 목포 공고 본문 "교향악단 트럼펫 수석 1, 합창단 소프라노 1, 무용단 한국무용 1" → TRUMPET, SOPRANO (한국무용은 전공 표에 없음)
 * 2) '메조소프라노' 는 SOPRANO 로 겹치지 않고, '더블베이스' 는 BASS 로 겹치지 않는다
 * 3) 띄어쓴 '트 럼 펫' 도 찾는다, 등장 순서 유지, 중복 제거
 */
describe('extractMajors', () => {
  it('목포 공고 본문에서 트럼펫 · 소프라노를 찾는다', () => {
    expect(extractMajors('다. 모집인원 : 3명(교향악단 트럼펫 수석 1, 합창단 소프라노 1, 무용단 한국무용 1)')).toEqual([MAJOR.TRUMPET, MAJOR.SOPRANO]);
  });

  it('긴 낱말이 짧은 낱말을 가린다', () => {
    expect(extractMajors('메조소프라노 1명')).toEqual([MAJOR.MEZZO_SOPRANO]);
    expect(extractMajors('더블베이스 1명, 콘트라베이스 1명')).toEqual([MAJOR.DOUBLE_BASE]);
    expect(extractMajors('베이스 1명, 베이스기타 1명')).toEqual([MAJOR.BASS, MAJOR.BASS_GUITAR]);
  });

  it('띄어쓰기 · 순서 · 중복', () => {
    expect(extractMajors('트 럼 펫, 소프라노, 트럼펫')).toEqual([MAJOR.TRUMPET, MAJOR.SOPRANO]);
    expect(extractMajors('채용 공고')).toEqual([]);
  });
});
