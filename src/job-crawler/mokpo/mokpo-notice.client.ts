import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { jobCrawlerConfig } from '../job-crawler.config';
import { MokpoAttachment } from './mokpo-notice.parser';

export interface MokpoDetailPage {
  url: string;
  html: string;
  /** 상세 페이지가 내려준 세션 쿠키 — 첨부 다운로드 때 그대로 돌려준다 */
  cookies: string[];
}

/** 테스트에서 가짜로 바꾸기 위한 목포시 사이트 접근 경계 */
export interface MokpoNoticeGateway {
  fetchListPage(page: number): Promise<string>;
  fetchDetail(idx: string): Promise<MokpoDetailPage>;
  downloadAttachment(detail: MokpoDetailPage, csrfToken: string, attachment: MokpoAttachment): Promise<Buffer>;
}

/**
 * 목포시 고시·공고 게시판 HTTP 클라이언트.
 * 첨부파일은 상세 페이지의 숨은 폼(goDownLoad) 과 같은 방식으로 eminwon 서버에 POST 해서 받는다.
 */
@Injectable()
export class MokpoNoticeClient implements MokpoNoticeGateway {
  private readonly http: AxiosInstance;

  constructor() {
    this.http = axios.create({
      timeout: jobCrawlerConfig.httpTimeoutMs,
      headers: { 'User-Agent': jobCrawlerConfig.userAgent, 'Accept-Language': 'ko-KR,ko;q=0.9' },
      maxRedirects: 5,
    });
  }

  async fetchListPage(page: number): Promise<string> {
    const res = await this.http.get<string>(jobCrawlerConfig.mokpo.listUrl, { params: page > 1 ? { page } : undefined, responseType: 'text' });
    return res.data;
  }

  async fetchDetail(idx: string): Promise<MokpoDetailPage> {
    const url = `${jobCrawlerConfig.mokpo.listUrl}?idx=${idx}&mode=view`;
    const res = await this.http.get<string>(url, { responseType: 'text' });
    const setCookie = (res.headers['set-cookie'] ?? []) as string[];
    return { url, html: res.data, cookies: setCookie.map(c => c.split(';')[0]) };
  }

  async downloadAttachment(detail: MokpoDetailPage, csrfToken: string, attachment: MokpoAttachment): Promise<Buffer> {
    const form = new URLSearchParams({
      csrf_token: csrfToken,
      user_file_nm: attachment.name,
      sys_file_nm: attachment.sysFileName,
      file_path: attachment.filePath,
    });
    const res = await this.http.post<ArrayBuffer>(jobCrawlerConfig.mokpo.downloadUrl, form.toString(), {
      responseType: 'arraybuffer',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Referer: detail.url,
        ...(detail.cookies.length ? { Cookie: detail.cookies.join('; ') } : {}),
      },
    });
    const buffer = Buffer.from(res.data);
    const contentType = String(res.headers['content-type'] ?? '');
    if (buffer.length === 0 || contentType.includes('text/html')) {
      throw new Error(`첨부파일 다운로드 실패: ${attachment.name} (content-type ${contentType || '없음'}, ${buffer.length} bytes)`);
    }
    return buffer;
  }
}
