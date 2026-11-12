import * as fs from 'fs';
import * as path from 'path';
import { parseChuncheonNoticeDetail, parseChuncheonNoticeList, pickChuncheonNoticeDocument } from './chuncheon-notice.parser';

/**
 * 스펙 (실제 페이지 픽스처, 2026-11-12 기준 춘천시립예술단 채용공고):
 * 1) 목록 1페이지는 고정 글 3건 + 일반 7건 = 10행. 고정 글은 pinned. seq·분류·제목·작성자·등록일·상세 URL 을 읽고 일반 행은 등록일 내림차순이다
 * 2) 2페이지는 일반 10행 (고정 글은 1페이지에만)
 * 3) 상세: 제목('[채용진행]' 접두 제거) · 작성자 · 등록일 · 본문 · 본문 이미지(공고문 jpg) · 첨부 2개(응시원서 hwp · 과제곡 pdf) 의 이름·확장자·다운로드 URL
 * 4) 공고문 첨부 고르기: 응시원서·과제곡뿐이면 없음(본문 이미지가 공고문) → '공고' 가 든 HWP/PDF 가 있으면 그것 → 서식·악보가 아닌 문서
 */
const fixture = (name: string) => fs.readFileSync(path.join(__dirname, '__fixtures__', name), 'utf8');

describe('parseChuncheonNoticeList', () => {
  it('고정 글과 일반 글을 모두 읽고 고정 글은 pinned 로 표시한다', () => {
    const rows = parseChuncheonNoticeList(fixture('list-2026-11-12-p1.html'));
    expect(rows).toHaveLength(10);
    expect(rows.filter(r => r.pinned).map(r => r.id)).toEqual(['13715', '13701', '13695']);
    expect(rows[1]).toEqual({
      id: '13701',
      category: '채용진행',
      title: '춘천시립교향악단 상임단원 선발 전형(정정) 공고',
      department: '예술단 인사담당',
      registeredAt: '2026-11-09',
      pinned: true,
      url: 'https://cccf.or.kr/art/company_news/recruit_notice?articleSeq=13701',
    });
    expect(rows[3]).toEqual({
      id: '13696',
      category: '채용진행',
      title: '춘천시립교향악단 상임단원 선발 전형 공고',
      department: '예술단 인사담당',
      registeredAt: '2026-11-06',
      pinned: false,
      url: 'https://cccf.or.kr/art/company_news/recruit_notice?articleSeq=13696',
    });
    expect(rows[5]).toMatchObject({
      id: '13675',
      category: '합격공고',
      title: '춘천시립합창단 상임단원 선발 전형 1차 합격자 공고',
      registeredAt: '2026-10-27',
    });
    expect(rows.filter(r => !r.pinned).map(r => r.registeredAt)).toEqual([
      '2026-11-06',
      '2026-10-30',
      '2026-10-27',
      '2026-10-01',
      '2026-09-14',
      '2026-08-26',
      '2026-08-26',
    ]);
  });

  it('2페이지는 일반 글만 있다', () => {
    const rows = parseChuncheonNoticeList(fixture('list-2026-11-12-p2.html'));
    expect(rows).toHaveLength(10);
    expect(rows.every(r => !r.pinned)).toBe(true);
    expect(rows[0]).toMatchObject({ id: '13526', title: '춘천시립청소년교향악단 2026년도 제2차 비상임단원 모집 공고', registeredAt: '2026-08-18' });
    expect(rows[9]).toMatchObject({
      id: '12109',
      category: '합격공고',
      title: '춘천시립교향악단 상임(차석) 단원 채용 최종 결과 공고',
      registeredAt: '2026-01-29',
    });
  });

  it('표가 없으면 빈 배열', () => {
    expect(parseChuncheonNoticeList('<html><body>점검 중</body></html>')).toEqual([]);
  });
});

describe('parseChuncheonNoticeDetail', () => {
  it('정정 공고: 제목·작성자·등록일·본문 이미지·첨부를 읽는다 (본문 글은 없음)', () => {
    const detail = parseChuncheonNoticeDetail(fixture('detail-13701.html'));
    expect(detail.title).toBe('춘천시립교향악단 상임단원 선발 전형(정정) 공고');
    expect(detail.department).toBe('예술단 인사담당');
    expect(detail.registeredAt).toBe('2026-11-09');
    expect(detail.bodyText).toBe('');
    expect(detail.images).toEqual([
      {
        name: '상임단원 정정 공고001-vert.jpg',
        url: 'https://cccf.or.kr/upload/image_attach/2026/11/%EC%83%81%EC%9E%84%EB%8B%A8%EC%9B%90%20%EC%A0%95%EC%A0%95%20%EA%B3%B5%EA%B3%A0001-vert.jpg',
      },
    ]);
    expect(detail.attachments).toEqual([
      { name: '응시원서, 개인정보 제공 동의서.hwp', ext: 'hwp', url: 'https://cccf.or.kr/egf/bp/common/front/15507/download' },
      { name: '2차 실기 과제곡 악보.pdf', ext: 'pdf', url: 'https://cccf.or.kr/egf/bp/common/front/15508/download' },
    ]);
  });

  it('원 공고: 본문 안내 글과 이미지를 따로 읽는다', () => {
    const detail = parseChuncheonNoticeDetail(fixture('detail-13696.html'));
    expect(detail.title).toBe('춘천시립교향악단 상임단원 선발 전형 공고');
    expect(detail.registeredAt).toBe('2026-11-06');
    expect(detail.bodyText).toBe('본 공고는 변경 전 공고입니다.\n\n변경된 공고를(2026-203호) 확인하여 주시기 바랍니다');
    expect(detail.images.map(i => i.name)).toEqual(['붙임1_청소년교향악단 2026년도 제2차 비상임단원 선발 공고문001-vert.jpg']);
    expect(detail.attachments.map(a => a.url)).toEqual([
      'https://cccf.or.kr/egf/bp/common/front/15493/download',
      'https://cccf.or.kr/egf/bp/common/front/15494/download',
    ]);
  });
});

describe('pickChuncheonNoticeDocument', () => {
  const att = (name: string) => ({
    name,
    ext: name.slice(name.lastIndexOf('.') + 1).toLowerCase(),
    url: `https://cccf.or.kr/egf/bp/common/front/${name}/download`,
  });

  it('응시원서 hwp 와 과제곡 pdf 뿐이면 고르지 않는다 (본문 이미지가 공고문)', () => {
    expect(pickChuncheonNoticeDocument([att('응시원서, 개인정보 제공 동의서.hwp'), att('2차 실기 과제곡 악보.pdf')])).toBeUndefined();
  });

  it("'공고' 가 든 문서가 있으면 그것, 없으면 서식·악보가 아닌 문서", () => {
    expect(pickChuncheonNoticeDocument([att('응시원서.hwp'), att('상임단원 선발 공고문.pdf')])?.name).toBe('상임단원 선발 공고문.pdf');
    expect(pickChuncheonNoticeDocument([att('지정곡.pdf'), att('모집요강.hwpx')])?.name).toBe('모집요강.hwpx');
    expect(pickChuncheonNoticeDocument([att('포스터.jpg'), att('자료.zip')])).toBeUndefined();
  });
});
