import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { jobCrawlerConfig } from '../job-crawler.config';
import { IncheonAttachment, incheonDetailUrl } from './incheon-notice.parser';

/** 테스트에서 가짜로 바꾸기 위한 인천문화예술회관 채용/공모 게시판 접근 경계 */
export interface IncheonNoticeGateway {
  fetchListPage(page: number): Promise<string>;
  fetchDetail(id: string): Promise<string>;
  downloadAttachment(attachment: IncheonAttachment): Promise<Buffer>;
}

/**
 * 인천광역시 누리집(humanframe 게시판) HTTP 클라이언트.
 * 목록 /art/ART040102?curPage=N, 상세 /art/ART040102/{id}, 첨부 /comm/getFile (모두 GET, 쿠키 불필요).
 */
@Injectable()
export class IncheonNoticeClient implements IncheonNoticeGateway {
  private readonly http: AxiosInstance;

  constructor() {
    this.http = axios.create({
      timeout: jobCrawlerConfig.httpTimeoutMs,
      headers: { 'User-Agent': jobCrawlerConfig.userAgent, 'Accept-Language': 'ko-KR,ko;q=0.9' },
      maxRedirects: 5,
    });
  }

  async fetchListPage(page: number): Promise<string> {
    const { origin, boardPath } = jobCrawlerConfig.incheon;
    const res = await this.http.get<string>(`${origin}${boardPath}`, { params: { curPage: page }, responseType: 'text' });
    return res.data;
  }

  async fetchDetail(id: string): Promise<string> {
    const { origin, boardPath } = jobCrawlerConfig.incheon;
    const res = await this.http.get<string>(incheonDetailUrl(id, origin, boardPath), { responseType: 'text' });
    return res.data;
  }

  async downloadAttachment(attachment: IncheonAttachment): Promise<Buffer> {
    const res = await this.http.get<ArrayBuffer>(attachment.url, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(res.data);
    const contentType = String(res.headers['content-type'] ?? '');
    if (buffer.length === 0 || contentType.includes('text/html')) {
      throw new Error(`첨부파일 다운로드 실패: ${attachment.name} (content-type ${contentType || '없음'}, ${buffer.length} bytes)`);
    }
    return buffer;
  }
}
