import { isPng, readPngSize } from './png-size';

/**
 * 스펙: PNG 바이너리의 IHDR 청크에서 가로·세로를 읽는다 (외부 이미지 라이브러리 없이).
 * 기대값은 Polaris Office 가 A4 HWP 를 내보냈을 때 실측된 793x1122 를 리터럴로 쓴다.
 */
function pngHeader(width: number, height: number): Buffer {
  const buf = Buffer.alloc(33);
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]).copy(buf, 0);
  buf.writeUInt32BE(13, 8);
  buf.write('IHDR', 12, 'ascii');
  buf.writeUInt32BE(width, 16);
  buf.writeUInt32BE(height, 20);
  return buf;
}

describe('readPngSize', () => {
  it('Polaris 가 내보낸 A4 PNG 크기(793x1122)를 읽는다', () => {
    expect(readPngSize(pngHeader(793, 1122))).toEqual({ width: 793, height: 1122 });
  });

  it('1x1 표준 최소 PNG 를 읽는다', () => {
    const oneByOne = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');
    expect(readPngSize(oneByOne)).toEqual({ width: 1, height: 1 });
    expect(isPng(oneByOne)).toBe(true);
  });

  it('PNG 가 아니면 예외를 던진다', () => {
    expect(() => readPngSize(Buffer.from('definitely not a png file content here'))).toThrow('PNG');
    expect(isPng(Buffer.from('nope'))).toBe(false);
  });
});
