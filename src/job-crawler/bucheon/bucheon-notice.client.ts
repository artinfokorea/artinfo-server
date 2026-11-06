import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { jobCrawlerConfig } from '../job-crawler.config';
import { BUCHEON_BOARDS, BucheonBoard, BucheonNoticeRow } from './bucheon-notice.parser';

/** 테스트에서 가짜로 바꾸기 위한 부천시립예술단 누리집 접근 경계 */
export interface BucheonNoticeGateway {
  fetchListPage(board: BucheonBoard, page: number): Promise<string>;
  fetchDetail(row: BucheonNoticeRow): Promise<string>;
  /** 첨부·본문 이미지 다운로드. referer 는 상세 페이지 URL — 없으면 "잘못된 접근" HTML 이 온다 */
  download(url: string, referer: string): Promise<Buffer>;
}

/**
 * 부천시립예술단 누리집 HTTP 클라이언트.
 * 목록 list.do?pageIndex=N, 상세 view.do?atcId= / ?rcrtId= (모두 GET), 첨부 /file/download.do?fileId= (Referer 필요), 본문 이미지 /upload/ckeditor/*.png
 */
@Injectable()
export class BucheonNoticeClient implements BucheonNoticeGateway {
  private readonly http: AxiosInstance;

  constructor() {
    this.http = axios.create({
      timeout: jobCrawlerConfig.httpTimeoutMs,
      headers: { 'User-Agent': jobCrawlerConfig.userAgent, 'Accept-Language': 'ko-KR,ko;q=0.9' },
      maxRedirects: 5,
    });
  }

  async fetchListPage(board: BucheonBoard, page: number): Promise<string> {
    const url = `${jobCrawlerConfig.bucheon.origin}${BUCHEON_BOARDS[board].listPath}`;
    const res = await this.http.get<string>(url, { params: { pageIndex: page }, responseType: 'text' });
    return res.data;
  }

  async fetchDetail(row: BucheonNoticeRow): Promise<string> {
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
