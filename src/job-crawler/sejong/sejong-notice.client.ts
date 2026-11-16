import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { jobCrawlerConfig } from '../job-crawler.config';
import { SEJONG_LIST_PATH, SEJONG_MENU_NO, SejongNoticeRow } from './sejong-notice.parser';

/** 테스트에서 가짜로 바꾸기 위한 세종문화회관 채용공고 게시판 접근 경계 */
export interface SejongNoticeGateway {
  fetchListPage(page: number): Promise<string>;
  fetchDetail(row: SejongNoticeRow): Promise<string>;
  /** 첨부·본문 이미지 다운로드 (쿠키·Referer 불필요, Referer 는 예의상 보낸다) */
  download(url: string, referer: string): Promise<Buffer>;
}

/**
 * 세종문화회관 누리집(채용공고 B0000065) HTTP 클라이언트.
 * 목록 /portal/bbs/B0000065/list.do?menuNo=200571&pageIndex=N, 상세 view.do?nttId=&menuNo=,
 * 첨부 /portal/cmmn/file/fileDown.do?atchFileId=&fileSn=&bbsId= — 모두 GET. 본문 이미지는 외부 채용 사이트(career.co.kr · incruit) 에 있다.
 */
@Injectable()
export class SejongNoticeClient implements SejongNoticeGateway {
  private readonly http: AxiosInstance;

  constructor() {
    this.http = axios.create({
      timeout: jobCrawlerConfig.httpTimeoutMs,
      headers: { 'User-Agent': jobCrawlerConfig.userAgent, 'Accept-Language': 'ko-KR,ko;q=0.9' },
      maxRedirects: 5,
    });
  }

  async fetchListPage(page: number): Promise<string> {
    const url = `${jobCrawlerConfig.sejong.origin}${SEJONG_LIST_PATH}`;
    const res = await this.http.get<string>(url, { params: { menuNo: SEJONG_MENU_NO, pageIndex: page }, responseType: 'text' });
    return res.data;
  }

  async fetchDetail(row: SejongNoticeRow): Promise<string> {
    const res = await this.http.get<string>(row.url, { responseType: 'text' });
    return res.data;
  }

  async download(url: string, referer: string): Promise<Buffer> {
    const res = await this.http.get<ArrayBuffer>(url, { responseType: 'arraybuffer', headers: { Referer: referer } });
    const buffer = Buffer.from(res.data);
    const contentType = String(res.headers['content-type'] ?? '');
    if (buffer.length === 0 || contentType.includes('text/html')) {
      throw new Error(`다운로드 실패: ${url} (content-type ${contentType || '없음'}, ${buffer.length} bytes)`);
    }
    return buffer;
  }
}
