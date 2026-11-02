import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { jobCrawlerConfig } from '../job-crawler.config';
import { UlsanAttachment, ulsanDetailUrl } from './ulsan-notice.parser';

export interface UlsanDetailPage {
  url: string;
  html: string;
  /** 상세 페이지가 내려준 세션 쿠키(JSESSIONID) — 이게 없으면 다운로드가 "조회 권한이 없습니다" 로 막힌다 */
  cookies: string[];
}

/** 테스트에서 가짜로 바꾸기 위한 울산문화예술회관 사이트 접근 경계 */
export interface UlsanNoticeGateway {
  fetchListPage(page: number): Promise<string>;
  fetchDetail(bodSn: string): Promise<UlsanDetailPage>;
  downloadAttachment(detail: UlsanDetailPage, attachment: UlsanAttachment): Promise<Buffer>;
}

/**
 * 울산문화예술회관 공지사항 HTTP 클라이언트.
 * 첨부는 GET board_download.do 로 받되, 상세 페이지를 본 세션의 쿠키와 Referer 를 함께 보내야 한다.
 */
@Injectable()
export class UlsanNoticeClient implements UlsanNoticeGateway {
  private readonly http: AxiosInstance;

  constructor() {
    this.http = axios.create({
      timeout: jobCrawlerConfig.httpTimeoutMs,
      headers: { 'User-Agent': jobCrawlerConfig.userAgent, 'Accept-Language': 'ko-KR,ko;q=0.9' },
      maxRedirects: 5,
    });
  }

  async fetchListPage(page: number): Promise<string> {
    const { pageUrl, menuCode } = jobCrawlerConfig.ulsan;
    const res = await this.http.get<string>(pageUrl, { params: { mnu_code: menuCode, ...(page > 1 ? { pageNo: page } : {}) }, responseType: 'text' });
    return res.data;
  }

  async fetchDetail(bodSn: string): Promise<UlsanDetailPage> {
    const url = ulsanDetailUrl(jobCrawlerConfig.ulsan.menuCode, bodSn);
    const res = await this.http.get<string>(url, { responseType: 'text' });
    const setCookie = (res.headers['set-cookie'] ?? []) as string[];
    return { url, html: res.data, cookies: setCookie.map(c => c.split(';')[0]) };
  }

  async downloadAttachment(detail: UlsanDetailPage, attachment: UlsanAttachment): Promise<Buffer> {
    const res = await this.http.get<ArrayBuffer>(attachment.url, {
      responseType: 'arraybuffer',
      headers: { Referer: detail.url, ...(detail.cookies.length ? { Cookie: detail.cookies.join('; ') } : {}) },
    });
    const buffer = Buffer.from(res.data);
    const contentType = String(res.headers['content-type'] ?? '');
    if (buffer.length === 0 || contentType.includes('text/html')) {
      throw new Error(`첨부파일 다운로드 실패: ${attachment.name} (content-type ${contentType || '없음'}, ${buffer.length} bytes)`);
    }
    return buffer;
  }
}
