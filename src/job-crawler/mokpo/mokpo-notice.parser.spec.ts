import * as fs from 'fs';
import * as path from 'path';
import { parseMokpoNoticeDetail, parseMokpoNoticeList, pickNoticeAttachment } from './mokpo-notice.parser';

/**
 * 스펙 (2026-10-20 에 저장한 실제 페이지 픽스처):
 * 1) 목록 15행, 첫 행 idx 55387 · 등록일 2026-10-20, '새로운글' 아이콘 텍스트는 제목에서 빠진다
 * 2) 목포시립예술단 채용 공고 행 — idx 55362, 부서 문화예술과, 상세 URL
 * 3) 상세: 제목 · 본문 줄 · CSRF 토큰 · 첨부 4개(hwpx 2, pdf 2) 와 goDownLoad 인자
 * 4) 첨부 선택: '(공고문) …' hwpx 가 '(별지서식) …' 보다 먼저
 */
const fixture = (name: string) => fs.readFileSync(path.join(__dirname, '__fixtures__', name), 'utf8');

describe('parseMokpoNoticeList', () => {
  const rows = parseMokpoNoticeList(fixture('list-2026-10-20.html'));

  it('15행을 읽고 첫 행은 idx 55387 · 2026-10-20', () => {
    expect(rows).toHaveLength(15);
    expect(rows[0]).toEqual({
      idx: '55387',
      title: '건설산업기본법 위반업체 행정처분(영업정지) 공고',
      department: '도시디자인과',
      registeredAt: '2026-10-20',
      url: 'https://www.mokpo.go.kr/www/mokpo_news/notification/public_notice?idx=55387&mode=view',
    });
  });

  it('목포시립예술단 채용 공고 행을 찾는다', () => {
    const row = rows.find(r => r.idx === '55362')!;
    expect(row.title).toBe('2026년도 목포시립예술단 단원 공개채용 공고');
    expect(row.department).toBe('문화예술과');
    expect(row.registeredAt).toBe('2026-10-20');
  });
});

describe('parseMokpoNoticeDetail', () => {
  const detail = parseMokpoNoticeDetail(fixture('detail-55362.html'));

  it('제목 · 본문 · 토큰을 읽는다', () => {
    expect(detail.title).toBe('2026년도 목포시립예술단 단원 공개채용 공고');
    expect(detail.csrfToken).toBe('9422c30df92b2ca48930c842f456985f46ba3a04eb3e1573ac573d5abc4e60dd');
    const lines = detail.bodyText.split('\n');
    expect(lines[0]).toBe(
      '목포시립예술단의 안정적인 운영과 우수한 예술인력 충원을 위하여 2026년도 목포시립예술단 단원 공개채용 공고문을 아래와 같이 시 홈페이지에 게재하고자 합니다.',
    );
    expect(detail.bodyText).toContain('다. 모집인원 : 3명(교향악단 트럼펫 수석 1, 합창단 소프라노 1, 무용단 한국무용 1)');
    expect(detail.bodyText).not.toMatch(/\n\n\n/);
  });

  it('첨부 4개와 goDownLoad 인자를 읽는다', () => {
    expect(detail.attachments.map(a => [a.name, a.ext])).toEqual([
      ['(공고문) 2026 시립예술단 단원 채용 모집 공고.hwpx', 'hwpx'],
      ['(별지서식) 2026 시립예술단 단원 채용 모집 서식.hwpx', 'hwpx'],
      ['(시립합창단) 소프라노 수선화 악보.pdf', 'pdf'],
      ['(시립교향악단) trumpet Exerpt(악보)_opt.pdf', 'pdf'],
    ]);
    expect(detail.attachments[0].sysFileName.startsWith('(공고문) 2b156z')).toBe(true);
    expect(detail.attachments[0].filePath).toBe('/ntishoh/wg938Ptfrv0sHVs/0oQyx6ecoRbmOwmPhyEc6tNRJwN12iM4/OKc58365yVPsz');
  });

  it('공고문 hwpx 를 고른다', () => {
    expect(pickNoticeAttachment(detail.attachments)?.name).toBe('(공고문) 2026 시립예술단 단원 채용 모집 공고.hwpx');
  });
});

describe('pickNoticeAttachment', () => {
  const att = (name: string) => ({ name, ext: name.slice(name.lastIndexOf('.') + 1).toLowerCase(), sysFileName: 's', filePath: 'p' });

  it("'공고문' 이 없으면 '공고' 가 든 hwp, 그것도 없으면 첫 hwp", () => {
    expect(pickNoticeAttachment([att('a.pdf'), att('서식.hwp'), att('2026 채용 공고.hwp')])?.name).toBe('2026 채용 공고.hwp');
    expect(pickNoticeAttachment([att('a.pdf'), att('서식.hwpx')])?.name).toBe('서식.hwpx');
    expect(pickNoticeAttachment([att('a.pdf')])).toBeUndefined();
  });
});
