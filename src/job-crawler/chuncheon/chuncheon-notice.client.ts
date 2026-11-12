import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { jobCrawlerConfig } from '../job-crawler.config';
import { CHUNCHEON_BOARD_PATH, ChuncheonNoticeRow } from './chuncheon-notice.parser';

/** 테스트에서 가짜로 바꾸기 위한 춘천시립예술단 채용공고 게시판 접근 경계 */
export interface ChuncheonNoticeGateway {
  fetchListPage(page: number): Promise<string>;
  fetchDetail(row: ChuncheonNoticeRow): Promise<string>;
  /** 첨부·본문 이미지 다운로드 (쿠키·Referer 불필요, Referer 는 예의상 보낸다) */
  download(url: string, referer: string): Promise<Buffer>;
}

/**
 * 춘천문화재단 누리집(춘천시립예술단) HTTP 클라이언트.
 * 목록 /art/company_news/recruit_notice?pageIndex=N&firstYN=N&searchCondition=TITLE, 상세 ?articleSeq= (화면은 폼 POST 지만 GET 으로도 열린다),
 * 첨부 /egf/bp/common/front/{fileId}/download, 본문 이미지 /upload/image_attach/… — 모두 GET.
 */
@Injectable()
export class ChuncheonNoticeClient implements ChuncheonNoticeGateway {
  private readonly http: AxiosInstance;

  constructor() {
    this.http = axios.create({
      timeout: jobCrawlerConfig.httpTimeoutMs,
      headers: { 'User-Agent': jobCrawlerConfig.userAgent, 'Accept-Language': 'ko-KR,ko;q=0.9' },
      maxRedirects: 5,
    });
  }

  async fetchListPage(page: number): Promise<string> {
    const url = `${jobCrawlerConfig.chuncheon.origin}${CHUNCHEON_BOARD_PATH}`;
    const res = await this.http.get<string>(url, { params: { pageIndex: page, firstYN: 'N', searchCondition: 'TITLE' }, responseType: 'text' });
    return res.data;
  }

  async fetchDetail(row: ChuncheonNoticeRow): Promise<string> {
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
