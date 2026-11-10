import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { CONTEST_LIST_URL, contestDetailUrl } from './contest-notice.parser';

/** 테스트에서 가짜로 바꾸기 위한 contest.co.kr 접근 경계 */
export interface ContestNoticeGateway {
  fetchList(): Promise<string>;
  fetchDetail(id: string): Promise<string>;
}

@Injectable()
export class ContestNoticeClient implements ContestNoticeGateway {
  private readonly http: AxiosInstance;

  constructor() {
    this.http = axios.create({
      timeout: Number(process.env.COMPETITION_CRAWLER_HTTP_TIMEOUT_MS ?? 30000),
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; ArtinfoBot/1.0; +https://www.artinfokorea.com)', 'Accept-Language': 'ko-KR,ko;q=0.9' },
      maxRedirects: 5,
    });
  }

  async fetchList(): Promise<string> {
    const res = await this.http.get<string>(CONTEST_LIST_URL, { responseType: 'text' });
    return res.data;
  }

  async fetchDetail(id: string): Promise<string> {
    const res = await this.http.get<string>(contestDetailUrl(id), { responseType: 'text' });
    return res.data;
  }
}
