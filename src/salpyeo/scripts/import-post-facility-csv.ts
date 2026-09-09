import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

/**
 * 공공데이터포털 "보건복지부_전국 산후조리원 현황" CSV → 살펴 시드 상수 변환.
 *
 *   npx ts-node -r tsconfig-paths/register src/salpyeo/scripts/import-post-facility-csv.ts "<csv 경로>" 2023-12-31
 *
 * - CSV 는 CP949(EUC-KR) 인코딩, 헤더: 번호,시도,시군구,운영주체,산후조리원,주소,전화번호,일반실,특실
 * - 요금 단위는 만원(2주 기준). 소수점(예: 226.8) 도 있어 원 단위 정수로 환산해 저장한다.
 * - 결과는 domain/constant/salpyeo-post-facility-data.constant.ts 에 덮어쓴다 (커밋 대상, 손으로 수정 금지).
 */

const HEADER = ['번호', '시도', '시군구', '운영주체', '산후조리원', '주소', '전화번호', '일반실', '특실'] as const;
const OUTPUT = resolve(__dirname, '../facility/domain/constant/salpyeo-post-facility-data.constant.ts');

/** RFC4180 수준의 최소 CSV 파서 — 따옴표 안 쉼표·줄바꿈·"" 이스케이프 처리 */
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          cell += '"';
          i++;
        } else quoted = false;
      } else cell += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ',') {
      row.push(cell);
      cell = '';
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = '';
    } else cell += ch;
  }
  if (cell !== '' || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }
  return rows.filter(r => r.some(c => c.trim() !== ''));
}

/** "470" / "226.8" / "1,200" (만원) → 원 단위 정수, 빈 값은 null */
function toWon(raw: string): number | null {
  const s = raw.trim().replace(/,/g, '');
  if (s === '') return null;
  if (!/^\d+(\.\d+)?$/.test(s)) throw new Error(`요금 값을 해석할 수 없습니다: "${raw}"`);
  return Math.round(Number(s) * 10_000);
}

function normalizeOperator(raw: string): '민간' | '지자체' {
  const s = raw.trim();
  if (s === '민간' || s === '지자체') return s;
  throw new Error(`알 수 없는 운영주체: "${raw}"`);
}

const q = (s: string) => `'${s.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;

function main() {
  const [csvPath, asOf] = process.argv.slice(2);
  if (!csvPath || !/^\d{4}-\d{2}-\d{2}$/.test(asOf ?? '')) {
    console.error('사용법: import-post-facility-csv.ts <csv 경로> <기준일 YYYY-MM-DD>');
    process.exit(1);
  }

  const text = new TextDecoder('euc-kr').decode(readFileSync(csvPath));
  const [header, ...body] = parseCsv(text);
  const cleanHeader = header.map(h => h.replace(/^﻿/, '').trim());
  if (cleanHeader.join(',') !== HEADER.join(',')) throw new Error(`헤더가 예상과 다릅니다: ${cleanHeader.join(',')}`);

  const records = body.map((cols, i) => {
    const [no, sido, sigungu, operator, name, address, phone, standardRoom, specialRoom] = cols.map(c => c.trim().replace(/\s+/g, ' '));
    if (cols.length !== HEADER.length) throw new Error(`${i + 2}행 컬럼 수가 ${cols.length}개입니다`);
    if (!name || !sido || !sigungu) throw new Error(`${i + 2}행 필수값 누락`);
    return {
      no: Number(no),
      sido,
      sigungu,
      operator: normalizeOperator(operator),
      name,
      address,
      phone,
      standardRoomPrice: toWon(standardRoom),
      specialRoomPrice: toWon(specialRoom),
    };
  });

  const lines = records.map(
    r =>
      `  { no: ${r.no}, sido: ${q(r.sido)}, sigungu: ${q(r.sigungu)}, operator: ${q(r.operator)}, name: ${q(r.name)}, address: ${q(r.address)}, phone: ${q(r.phone)}, standardRoomPrice: ${r.standardRoomPrice}, specialRoomPrice: ${r.specialRoomPrice} },`,
  );

  const out = `/**
 * 자동 생성 파일 — 손으로 수정하지 말 것.
 * 원본: 공공데이터포털 "보건복지부_전국 산후조리원 현황" (기준일 ${asOf}, ${records.length}건)
 * 재생성: npx ts-node -r tsconfig-paths/register src/salpyeo/scripts/import-post-facility-csv.ts "<csv>" ${asOf}
 */

export interface SalpyeoPostFacilityRecord {
  /** 원본 CSV 순번 — 정렬 동률 시 기준 */
  no: number;
  sido: string;
  sigungu: string;
  operator: '민간' | '지자체';
  name: string;
  address: string;
  phone: string;
  /** 2주 일반실 요금 (원). 미공개면 null */
  standardRoomPrice: number | null;
  /** 2주 특실 요금 (원). 미공개면 null */
  specialRoomPrice: number | null;
}

export const SALPYEO_POST_FACILITY_DATA_SOURCE = {
  title: '보건복지부 전국 산후조리원 현황',
  asOf: '${asOf}',
} as const;

// prettier-ignore
export const SALPYEO_POST_FACILITY_RECORDS: readonly SalpyeoPostFacilityRecord[] = [
${lines.join('\n')}
];
`;
  writeFileSync(OUTPUT, out);
  console.log(`${records.length}건 → ${OUTPUT}`);
}

main();
