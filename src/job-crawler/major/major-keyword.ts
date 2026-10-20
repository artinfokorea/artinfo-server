import { MAJOR } from '@/job/entity/major-category.entity';

/**
 * 공고 제목·본문에서 전공을 찾기 위한 낱말 → 전공 코드 표.
 * 긴 낱말부터 맞춰 '메조소프라노' 가 '소프라노' 로, '더블베이스' 가 '베이스' 로 겹치지 않게 한다.
 * 행정(기획·홍보·경영) 은 일반 문장에 흔히 나와 제외한다.
 */
const MAJOR_KEYWORDS: [string, MAJOR][] = [
  ['메조소프라노', MAJOR.MEZZO_SOPRANO],
  ['메조 소프라노', MAJOR.MEZZO_SOPRANO],
  ['소프라노', MAJOR.SOPRANO],
  ['알토', MAJOR.ALTO],
  ['테너', MAJOR.TENOR],
  ['바리톤', MAJOR.BARITONE],
  ['베이스기타', MAJOR.BASS_GUITAR],
  ['베이스 기타', MAJOR.BASS_GUITAR],
  ['더블베이스', MAJOR.DOUBLE_BASE],
  ['더블 베이스', MAJOR.DOUBLE_BASE],
  ['콘트라베이스', MAJOR.DOUBLE_BASE],
  ['콘트라바스', MAJOR.DOUBLE_BASE],
  ['베이스', MAJOR.BASS],
  ['바이올린', MAJOR.VIOLIN],
  ['비올라', MAJOR.VIOLA],
  ['첼로', MAJOR.CELLO],
  ['하프', MAJOR.HARP],
  ['플루트', MAJOR.FLUTE],
  ['플룻', MAJOR.FLUTE],
  ['오보에', MAJOR.OBOE],
  ['클라리넷', MAJOR.CLARINET],
  ['바순', MAJOR.BASSOON],
  ['파곳', MAJOR.BASSOON],
  ['호른', MAJOR.HORN],
  ['트럼펫', MAJOR.TRUMPET],
  ['트롬본', MAJOR.TROMBONE],
  ['튜바', MAJOR.TUBA],
  ['타악', MAJOR.PERCUSSION],
  ['팀파니', MAJOR.PERCUSSION],
  ['피아노', MAJOR.PIANO],
  ['오르간', MAJOR.ORGAN],
  ['지휘', MAJOR.CONDUCTOR],
  ['작곡', MAJOR.COMPOSER],
  ['가야금', MAJOR.GAYAGEUM],
  ['거문고', MAJOR.GEOMUNGO],
  ['아쟁', MAJOR.AJAENG],
  ['해금', MAJOR.HAEGEUM],
  ['대금', MAJOR.DAEGEUM],
  ['소금', MAJOR.SOGEUM],
  ['단소', MAJOR.DANSO],
  ['피리', MAJOR.PEERI],
  ['태평소', MAJOR.TAEPYEONGSO],
  ['사물놀이', MAJOR.SAMULNORI],
  ['장구', MAJOR.JANGGU],
  ['판소리', MAJOR.PANSORI],
  ['민요', MAJOR.MINYO],
];

/** 텍스트에 나오는 전공 코드 목록 (등장 순서, 중복 없음). 공백을 지운 뒤 비교한다. */
export function extractMajors(text: string): MAJOR[] {
  let rest = text.replace(/\s+/g, '');
  const found: { at: number; major: MAJOR }[] = [];
  const sorted = [...MAJOR_KEYWORDS].sort((a, b) => b[0].length - a[0].length);
  for (const [keyword, major] of sorted) {
    const compact = keyword.replace(/\s+/g, '');
    let at = rest.indexOf(compact);
    while (at !== -1) {
      found.push({ at, major });
      rest = rest.slice(0, at) + '\u0000'.repeat(compact.length) + rest.slice(at + compact.length);
      at = rest.indexOf(compact);
    }
  }
  const unique: MAJOR[] = [];
  for (const { major } of found.sort((a, b) => a.at - b.at)) {
    if (!unique.includes(major)) unique.push(major);
  }
  return unique;
}
