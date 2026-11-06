import * as fs from 'fs';
import * as path from 'path';
import { readZipEntries } from './zip-reader';

/**
 * 스펙 (픽스처 sample.zip: EUC-KR 이름 2개(deflate · stored) + UTF-8 플래그 폴더 1개와 파일 1개(deflate)):
 * 1) 폴더는 빼고 파일 3개를 이름·크기와 함께 읽는다. EUC-KR 이름(한글 윈도우 압축)도 UTF-8 이름도 한글로 풀린다
 * 2) deflate 항목과 stored 항목 모두 원본 내용을 돌려준다
 * 3) ZIP 이 아닌 버퍼는 오류
 */
const fixture = (name: string) => fs.readFileSync(path.join(__dirname, '__fixtures__', name));

describe('readZipEntries', () => {
  it('폴더를 빼고 파일 항목을 읽고, EUC-KR·UTF-8 이름을 모두 한글로 푼다', () => {
    const entries = readZipEntries(fixture('sample.zip'));
    expect(entries.map(e => [e.name, e.size])).toEqual([
      ['부천시립합창단 상임단원 채용 공고문.pdf', 320],
      ['응시원서(서식).hwpx', 12],
      ['지정곡/부천시립합창단 지정곡.pdf', 75],
    ]);
  });

  it('deflate · stored 항목의 내용을 풀어 준다', () => {
    const [deflated, stored, nested] = readZipEntries(fixture('sample.zip'));
    expect(deflated.data().toString()).toBe('%PDF-1.4 notice '.repeat(20));
    expect(stored.data().toString()).toBe('PK hwpx form');
    expect(nested.data().toString()).toBe('%PDF-1.4 songs '.repeat(5));
  });

  it('ZIP 이 아니면 오류', () => {
    expect(() => readZipEntries(Buffer.from('<html>잘못된 접근 입니다.</html>'))).toThrow('ZIP 파일이 아님');
    expect(() => readZipEntries(Buffer.alloc(0))).toThrow('ZIP 파일이 아님');
  });
});
