import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { jobCrawlerConfig } from '../job-crawler.config';
import { BoryeongAttachment, boryeongDetailUrl } from './boryeong-notice.parser';

/** 테스트에서 가짜로 바꾸기 위한 보령문화예술회관 공지사항 접근 경계 */
export interface BoryeongNoticeGateway {
  fetchListPage(page: number): Promise<string>;
  fetchDetail(nttId: string): Promise<string>;
  downloadAttachment(attachment: BoryeongAttachment): Promise<Buffer>;
}

/**
 * 보령시 누리집(전자정부 프레임워크 게시판) HTTP 클라이언트.
 * 목록 selectBoardList.do?bbsId=&pageIndex=N, 상세 selectBoardArticle.do?bbsId=&nttId=, 첨부 /cmm/fms/FileDown.do (쿠키 불필요).
 */
@Injectable()
export class BoryeongNoticeClient implements BoryeongNoticeGateway {
  private readonly http: AxiosInstance;

  constructor() {
    this.http = axios.create({
      timeout: jobCrawlerConfig.httpTimeoutMs,
      headers: { 'User-Agent': jobCrawlerConfig.userAgent, 'Accept-Language': 'ko-KR,ko;q=0.9' },
      maxRedirects: 5,
    });
  }

  async fetchListPage(page: number): Promise<string> {
    const { listUrl, bbsId } = jobCrawlerConfig.boryeong;
    const res = await this.http.get<string>(listUrl, { params: { bbsId, pageIndex: page }, responseType: 'text' });
    return res.data;
  }

  async fetchDetail(nttId: string): Promise<string> {
    const res = await this.http.get<string>(boryeongDetailUrl(jobCrawlerConfig.boryeong.bbsId, nttId), { responseType: 'text' });
    return res.data;
  }

  async downloadAttachment(attachment: BoryeongAttachment): Promise<Buffer> {
    const res = await this.http.get<ArrayBuffer>(attachment.url, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(res.data);
    const contentType = String(res.headers['content-type'] ?? '');
    if (buffer.length === 0 || contentType.includes('text/html')) {
      throw new Error(`첨부파일 다운로드 실패: ${attachment.name} (content-type ${contentType || '없음'}, ${buffer.length} bytes)`);
    }
    return buffer;
  }
}
