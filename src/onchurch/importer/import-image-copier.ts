import { Injectable, Logger } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { AwsS3Service } from '@/aws/s3/aws-s3.service';

const MAX_BYTES = 20 * 1024 * 1024;
const TIMEOUT_MS = 20_000;
const MAX_FILE_BYTES = 50 * 1024 * 1024;
const FILE_MIME: Record<string, string> = {
  pdf: 'application/pdf',
  hwp: 'application/x-hwp',
  hwpx: 'application/hwp+zip',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ppt: 'application/vnd.ms-powerpoint',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  xls: 'application/vnd.ms-excel',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  zip: 'application/zip',
};
const EXT: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/gif': 'gif', 'image/webp': 'webp' };

/** 다른 사이트 사진을 내려받아 우리 저장소(S3)에 올리고 새 주소를 돌려준다. 못 옮기면 null. */
@Injectable()
export class ImportImageCopier {
  private readonly logger = new Logger(ImportImageCopier.name);

  constructor(private readonly s3: AwsS3Service) {}

  async copy(url: string, churchId: number): Promise<string | null> {
    try {
      // 한글 파일명 등 ASCII 밖 글자만 인코딩한다(이미 %인코딩된 부분은 그대로)
      const safeUrl = url.replace(/[^\x00-\x7F]/g, c => encodeURIComponent(c));
      const res = await fetch(safeUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; everychurch-import/1.0)' },
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
      if (!res.ok) return null;
      const type = (res.headers.get('content-type') ?? '').split(';')[0].trim().toLowerCase();
      const ext = EXT[type];
      if (!ext) return null;
      const buffer = Buffer.from(await res.arrayBuffer());
      if (buffer.length === 0 || buffer.length > MAX_BYTES) return null;
      const day = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const key = ['onchurch-import', churchId, day, `${randomBytes(8).toString('hex')}.${ext}`].join('/');
      const result = await this.s3.uploadStream(buffer, type, key);
      return result?.location ?? null;
    } catch (error) {
      this.logger.warn(`가져오기 사진 복사 실패 ${url}: ${error}`);
      return null;
    }
  }

  /** 첨부파일(pdf·hwp 등)을 내려받아 저장소에 올린다. 내려받을 때 원래 이름이 유지되게 한다. 못 옮기면 null. */
  async copyFile(url: string, churchId: number, name: string): Promise<{ url: string; name: string; size: number; mimeType: string } | null> {
    try {
      const safeUrl = url.replace(/[^\x00-\x7F]/g, c => encodeURIComponent(c));
      const res = await fetch(safeUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; everychurch-import/1.0)' },
        signal: AbortSignal.timeout(60_000),
      });
      if (!res.ok) return null;
      const ext = (name.match(/\.([a-z0-9]+)$/i)?.[1] ?? 'bin').toLowerCase();
      const mimeType = FILE_MIME[ext] ?? 'application/octet-stream';
      const buffer = Buffer.from(await res.arrayBuffer());
      if (buffer.length === 0 || buffer.length > MAX_FILE_BYTES) return null;
      const day = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const key = ['onchurch-import', churchId, day, 'files', `${randomBytes(8).toString('hex')}.${ext}`].join('/');
      const disposition = `attachment; filename*=UTF-8''${encodeURIComponent(name)}`;
      const result = await this.s3.uploadStream(buffer, mimeType, key, disposition);
      return result ? { url: result.location, name, size: buffer.length, mimeType } : null;
    } catch (error) {
      this.logger.warn(`가져오기 첨부파일 복사 실패 ${url}: ${error}`);
      return null;
    }
  }
}
