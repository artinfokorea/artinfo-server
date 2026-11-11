import { Inject, Injectable, Logger, Optional } from '@nestjs/common';
import axios from 'axios';
import { createHash } from 'crypto';
import { AwsS3Service } from '@/aws/s3/aws-s3.service';

export const COMPETITION_IMAGE_DOWNLOADER = 'COMPETITION_IMAGE_DOWNLOADER';

/** 테스트에서 가짜로 바꾸기 위한 다운로드 경계 */
export interface ImageDownloader {
  download(url: string): Promise<{ buffer: Buffer; contentType: string }>;
}

const EXT_BY_MIME: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/gif': 'gif', 'image/webp': 'webp' };

/**
 * 수집한 공고의 포스터·본문 이미지를 원 사이트 대신 우리 S3 에 복사한다.
 * 원 사이트 링크를 그대로 쓰면 그쪽이 지우거나 핫링크를 막을 때 깨지고, 서비스가 그 사이트에 묶인다.
 * 같은 원본 URL 은 같은 키(해시)라 다시 올려도 URL 이 같다. 이미 우리 S3 URL 이면 그대로 둔다. 실패한 이미지는 뺀다.
 */
@Injectable()
export class CompetitionImageStore {
  private readonly logger = new Logger(CompetitionImageStore.name);
  private readonly downloader: ImageDownloader;

  constructor(
    private readonly s3: AwsS3Service,
    @Optional() @Inject(COMPETITION_IMAGE_DOWNLOADER) downloader?: ImageDownloader,
  ) {
    this.downloader = downloader ?? {
      download: async url => {
        const res = await axios.get<ArrayBuffer>(url, {
          responseType: 'arraybuffer',
          timeout: 30000,
          headers: { 'User-Agent': 'Mozilla/5.0 (compatible; ArtinfoBot/1.0; +https://www.artinfokorea.com)', Referer: new URL(url).origin + '/' },
        });
        return { buffer: Buffer.from(res.data), contentType: String(res.headers['content-type'] ?? '') };
      },
    };
  }

  isOurs(url: string): boolean {
    return /\.s3\.[a-z0-9-]+\.amazonaws\.com\//.test(url) || url.includes('artinfokorea.com/');
  }

  /** 하나 복사. 실패하면 null */
  async store(url: string, folder: string): Promise<string | null> {
    if (!url) return null;
    if (this.isOurs(url)) return url;
    try {
      const { buffer, contentType } = await this.downloader.download(url);
      const mime = contentType.split(';')[0].trim().toLowerCase();
      if (!mime.startsWith('image/') || buffer.length === 0) throw new Error(`이미지가 아님 (${mime || '없음'}, ${buffer.length} bytes)`);
      const ext = EXT_BY_MIME[mime] ?? 'jpg';
      const hash = createHash('sha1').update(url).digest('hex').slice(0, 16);
      const uploaded = await this.s3.uploadStream(buffer, mime, `upload/competitions/${folder}/${hash}.${ext}`);
      if (!uploaded) throw new Error('S3 업로드 실패');
      return uploaded.location;
    } catch (e) {
      this.logger.warn(`이미지 복사 실패 ${url}: ${e instanceof Error ? e.message : String(e)}`);
      return null;
    }
  }

  /** 여러 장 — 실패한 건 빼고 순서 유지 */
  async storeAll(urls: string[], folder: string): Promise<string[]> {
    const stored: string[] = [];
    for (const url of urls) {
      const ours = await this.store(url, folder);
      if (ours) stored.push(ours);
    }
    return stored;
  }
}
