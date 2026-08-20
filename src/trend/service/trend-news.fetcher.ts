import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

export interface FetchedArticle {
  title: string;
  press: string;
  link: string;
  publishedAt: string | null;
  snippet: string;
  body: string; // 본문 수집 실패 시 빈 문자열
}

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36';
const SEARCH_TIMEOUT_MS = 8000;
const ARTICLE_TIMEOUT_MS = 6000;
const BODY_MAX_CHARS = 1500; // 기사당 본문 상한 (토큰 비용 제어)

/**
 * 다음(Daum) 뉴스 검색 → 기사 목록 + 본문 수집
 * 다음은 검색 결과가 서버 렌더링이고 v.daum.net 기사 페이지 본문 셀렉터(.article_view)가 안정적이라 채택.
 * (네이버 검색은 JS 렌더링, 구글 뉴스 RSS는 리다이렉트 링크라 본문 수집이 불가)
 */
@Injectable()
export class TrendNewsFetcher {
  private readonly logger = new Logger(TrendNewsFetcher.name);

  async fetch(keyword: string, limit: number): Promise<FetchedArticle[]> {
    const list = await this.search(keyword, limit);
    const bodies = await Promise.all(list.map(a => this.fetchBody(a.link)));
    return list.map((a, i) => ({ ...a, body: bodies[i] }));
  }

  private async search(keyword: string, limit: number): Promise<Omit<FetchedArticle, 'body'>[]> {
    const url = `https://search.daum.net/search?w=news&q=${encodeURIComponent(keyword)}&sort=recency`;
    const { data: html } = await axios.get<string>(url, {
      headers: { 'User-Agent': UA, 'Accept-Language': 'ko-KR,ko;q=0.9' },
      timeout: SEARCH_TIMEOUT_MS,
      responseType: 'text',
    });

    const articles: Omit<FetchedArticle, 'body'>[] = [];
    const seen = new Set<string>();
    const itemRe = /<li data-docid="[^"]*">([\s\S]*?)<\/li>/g;
    let m: RegExpExecArray | null;
    while ((m = itemRe.exec(html)) !== null && articles.length < limit) {
      const block = m[1];
      const link = block.match(/class="tit-g[^"]*">\s*<a href="(https?:\/\/v\.daum\.net\/v\/\d+)"/)?.[1];
      if (!link) continue;
      const normalized = link.replace(/^http:/, 'https:');
      if (seen.has(normalized)) continue;

      const title = this.text(block.match(/class="tit-g[^"]*">\s*<a[^>]*>([\s\S]*?)<\/a>/)?.[1] ?? '');
      if (!title) continue;
      const press = this.text(block.match(/class="tit_item" title="([^"]*)"/)?.[1] ?? '');
      const snippet = this.text(block.match(/class="conts-desc[^"]*">\s*<a[^>]*>([\s\S]*?)<\/a>/)?.[1] ?? '');

      seen.add(normalized);
      articles.push({ title, press, link: normalized, publishedAt: this.dateFromDaumId(normalized), snippet });
    }
    return articles;
  }

  private async fetchBody(link: string): Promise<string> {
    try {
      const { data: html } = await axios.get<string>(link, {
        headers: { 'User-Agent': UA, 'Accept-Language': 'ko-KR,ko;q=0.9' },
        timeout: ARTICLE_TIMEOUT_MS,
        responseType: 'text',
        maxContentLength: 2 * 1024 * 1024,
      });
      const section = html.match(/<div[^>]*class="article_view"[^>]*>([\s\S]*?)<\/section>/)?.[1];
      if (!section) return '';
      const paragraphs = [...section.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/g)].map(p => this.text(p[1])).filter(p => p.length > 0);
      const body = (paragraphs.length ? paragraphs.join(' ') : this.text(section)).replace(/\s+/g, ' ').trim();
      return body.slice(0, BODY_MAX_CHARS);
    } catch (e: any) {
      this.logger.warn(`기사 본문 수집 실패 (${link}): ${e?.message ?? e}`);
      return '';
    }
  }

  // v.daum.net/v/YYYYMMDDHHmmssSSS — 기사 ID에 KST 발행시각이 인코딩되어 있다
  private dateFromDaumId(link: string): string | null {
    const id = link.match(/\/v\/(\d{14})/)?.[1];
    if (!id) return null;
    const [y, mo, d, h, mi, s] = [0, 4, 6, 8, 10, 12].map((i, idx) => Number(id.slice(i, [4, 6, 8, 10, 12, 14][idx])));
    return new Date(Date.UTC(y, mo - 1, d, h - 9, mi, s)).toISOString();
  }

  private text(html: string): string {
    return html
      .replace(/<script[\s\S]*?<\/script>/g, '')
      .replace(/<style[\s\S]*?<\/style>/g, '')
      .replace(/<[^>]+>/g, '')
      .replace(/&quot;|&#34;/g, '"')
      .replace(/&#39;|&apos;/g, "'")
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/\s+/g, ' ')
      .trim();
  }
}
