/**
 * PNG 바이너리에서 IHDR 청크를 읽어 가로·세로 픽셀 크기를 돌려준다.
 * 메타데이터만 필요해서 sharp 없이 직접 파싱한다.
 */
const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

export interface PngSize {
  width: number;
  height: number;
}

export function isPng(buffer: Buffer): boolean {
  return buffer.length >= 8 && buffer.subarray(0, 8).equals(PNG_SIGNATURE);
}

export function readPngSize(buffer: Buffer): PngSize {
  if (buffer.length < 24 || !isPng(buffer)) {
    throw new Error('PNG 시그니처가 아닙니다.');
  }
  // 8바이트 시그니처 뒤: 4바이트 길이, 4바이트 "IHDR", 4바이트 width, 4바이트 height
  if (buffer.toString('ascii', 12, 16) !== 'IHDR') {
    throw new Error('PNG IHDR 청크를 찾을 수 없습니다.');
  }
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
}
