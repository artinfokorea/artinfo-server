import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { jobCrawlerConfig } from '../job-crawler.config';
import { GimcheonAttachment, gimcheonDetailUrl } from './gimcheon-notice.parser';

/** 테스트에서 가짜로 바꾸기 위한 김천시문화예술회관 공지사항 게시판 접근 경계 */
export interface GimcheonNoticeGateway {
  fetchListPage(page: number): Promise<string>;
  fetchDetail(id: string): Promise<string>;
  downloadAttachment(attachment: GimcheonAttachment): Promise<Buffer>;
}

/**
 * 김천시 누리집(eGov 게시판) HTTP 클라이언트.
 * 목록 /gcart/bbs/list.do?searchCategory=&ptIdx=&mId=&page=N, 상세 /gcart/bbs/view.do?bIdx=, 첨부 /cmm/fms/FileDown.do (모두 GET, 쿠키 불필요).
 */
@Injectable()
export class GimcheonNoticeClient implements GimcheonNoticeGateway {
  private readonly http: AxiosInstance;

  constructor() {
    this.http = axios.create({
      timeout: jobCrawlerConfig.httpTimeoutMs,
      headers: { 'User-Agent': jobCrawlerConfig.userAgent, 'Accept-Language': 'ko-KR,ko;q=0.9' },
      maxRedirects: 5,
    });
  }

  async fetchListPage(page: number): Promise<string> {
    const { origin, listPath, board } = jobCrawlerConfig.gimcheon;
    const res = await this.http.get<string>(`${origin}${listPath}`, { params: { ...board, page }, responseType: 'text' });
    return res.data;
  }

  async fetchDetail(id: string): Promise<string> {
    const { origin, board } = jobCrawlerConfig.gimcheon;
    const res = await this.http.get<string>(gimcheonDetailUrl(id, origin, board), { responseType: 'text' });
    return res.data;
  }

  async downloadAttachment(attachment: GimcheonAttachment): Promise<Buffer> {
    const res = await this.http.get<ArrayBuffer>(attachment.url, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(res.data);
    const contentType = String(res.headers['content-type'] ?? '');
    if (buffer.length === 0 || contentType.includes('text/html')) {
      throw new Error(`첨부파일 다운로드 실패: ${attachment.name} (content-type ${contentType || '없음'}, ${buffer.length} bytes)`);
    }
    return buffer;
  }
}
