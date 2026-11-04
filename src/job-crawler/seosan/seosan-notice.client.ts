import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { jobCrawlerConfig } from '../job-crawler.config';
import { SeosanAttachment, seosanDetailUrl } from './seosan-notice.parser';

/** 테스트에서 가짜로 바꾸기 위한 서산시 채용공고(eminwon) 접근 경계 */
export interface SeosanNoticeGateway {
  fetchListPage(page: number): Promise<string>;
  fetchDetail(mgtNo: string): Promise<string>;
  downloadAttachment(attachment: SeosanAttachment): Promise<Buffer>;
}

/**
 * 서산시 누리집 채용공고 HTTP 클라이언트. 채용공고 페이지(contents.do?key=5309)는 eminwon 목록을 iframe 으로 끼우므로
 * iframe 주소(eminwonView.jsp)를 바로 읽는다. 목록 pageIndex=N, 상세 not_ancmt_mgt_no=, 첨부는 eminwon FileDown.jsp GET (쿠키 불필요).
 */
@Injectable()
export class SeosanNoticeClient implements SeosanNoticeGateway {
  private readonly http: AxiosInstance;

  constructor() {
    this.http = axios.create({
      timeout: jobCrawlerConfig.httpTimeoutMs,
      headers: { 'User-Agent': jobCrawlerConfig.userAgent, 'Accept-Language': 'ko-KR,ko;q=0.9' },
      maxRedirects: 5,
    });
  }

  async fetchListPage(page: number): Promise<string> {
    const { viewUrl, listParams } = jobCrawlerConfig.seosan;
    const res = await this.http.get<string>(viewUrl, { params: { ...listParams, pageIndex: page }, responseType: 'text' });
    return res.data;
  }

  async fetchDetail(mgtNo: string): Promise<string> {
    const res = await this.http.get<string>(seosanDetailUrl(mgtNo), { responseType: 'text' });
    return res.data;
  }

  async downloadAttachment(attachment: SeosanAttachment): Promise<Buffer> {
    const res = await this.http.get<ArrayBuffer>(attachment.url, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(res.data);
    const contentType = String(res.headers['content-type'] ?? '');
    if (buffer.length === 0 || contentType.includes('text/html')) {
      throw new Error(`첨부파일 다운로드 실패: ${attachment.name} (content-type ${contentType || '없음'}, ${buffer.length} bytes)`);
    }
    return buffer;
  }
}
