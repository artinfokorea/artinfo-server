import * as zlib from 'zlib';

export interface ZipEntry {
  /** 압축 파일 안 경로 (폴더 구분은 '/') */
  name: string;
  /** 원본 크기 (bytes) */
  size: number;
  /** 풀어낸 내용 */
  data(): Buffer;
}

const EOCD_SIGNATURE = 0x06054b50;
const CENTRAL_SIGNATURE = 0x02014b50;
const LOCAL_SIGNATURE = 0x04034b50;
/** 범용 비트 11 — 이름이 UTF-8 */
const FLAG_UTF8 = 0x0800;
const METHOD_STORED = 0;
const METHOD_DEFLATE = 8;

/**
 * ZIP 첨부(공고문 묶음)에서 파일 목록을 읽는다. 의존성 없이 zlib 만 쓴다.
 * - 중앙 디렉터리를 뒤에서부터 찾아 항목을 읽고, 내용은 data() 를 부를 때 푼다 (stored · deflate 만)
 * - 이름은 UTF-8 플래그가 있으면 UTF-8, 없으면 UTF-8 로 풀리면 그대로, 아니면 EUC-KR(한글 윈도우 압축) 로 읽는다
 * - 폴더 항목은 빼고, ZIP64 는 지원하지 않는다
 */
export function readZipEntries(buffer: Buffer): ZipEntry[] {
  const eocd = findEndOfCentralDirectory(buffer);
  const count = buffer.readUInt16LE(eocd + 10);
  let offset = buffer.readUInt32LE(eocd + 16);
  const entries: ZipEntry[] = [];

  for (let i = 0; i < count; i++) {
    if (offset + 46 > buffer.length || buffer.readUInt32LE(offset) !== CENTRAL_SIGNATURE) throw new Error('ZIP 중앙 디렉터리가 손상됨');
    const flags = buffer.readUInt16LE(offset + 8);
    const method = buffer.readUInt16LE(offset + 10);
    const compressedSize = buffer.readUInt32LE(offset + 20);
    const size = buffer.readUInt32LE(offset + 24);
    const nameLength = buffer.readUInt16LE(offset + 28);
    const extraLength = buffer.readUInt16LE(offset + 30);
    const commentLength = buffer.readUInt16LE(offset + 32);
    const localOffset = buffer.readUInt32LE(offset + 42);
    const name = decodeName(buffer.subarray(offset + 46, offset + 46 + nameLength), (flags & FLAG_UTF8) !== 0);
    offset += 46 + nameLength + extraLength + commentLength;

    if (name.endsWith('/')) continue;
    if (compressedSize === 0xffffffff || size === 0xffffffff) throw new Error(`ZIP64 는 지원하지 않음: ${name}`);
    entries.push({
      name,
      size,
      data: () => {
        if (buffer.readUInt32LE(localOffset) !== LOCAL_SIGNATURE) throw new Error(`ZIP 항목 헤더가 손상됨: ${name}`);
        const start = localOffset + 30 + buffer.readUInt16LE(localOffset + 26) + buffer.readUInt16LE(localOffset + 28);
        const compressed = buffer.subarray(start, start + compressedSize);
        if (method === METHOD_STORED) return Buffer.from(compressed);
        if (method === METHOD_DEFLATE) return zlib.inflateRawSync(compressed);
        throw new Error(`지원하지 않는 ZIP 압축 방식 ${method}: ${name}`);
      },
    });
  }
  return entries;
}

function findEndOfCentralDirectory(buffer: Buffer): number {
  const min = Math.max(0, buffer.length - 22 - 0xffff);
  for (let i = buffer.length - 22; i >= min; i--) {
    if (buffer.readUInt32LE(i) === EOCD_SIGNATURE) return i;
  }
  throw new Error('ZIP 파일이 아님 (중앙 디렉터리 끝을 찾을 수 없음)');
}

function decodeName(bytes: Buffer, utf8Flag: boolean): string {
  if (utf8Flag) return bytes.toString('utf8');
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  } catch {
    return new TextDecoder('euc-kr').decode(bytes);
  }
}
