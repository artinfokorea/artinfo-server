import { BadRequestException, Injectable } from '@nestjs/common';
import { WordpressPost } from '@/onchurch/importer/onchurch-wordpress-import.usecase';

const TIMEOUT_MS = 20_000;
const USER_AGENT = 'Mozilla/5.0 (compatible; everychurch-import/1.0)';

/** 사이트 주소를 정리한다: http(s) 만, 경로·쿼리는 버린다. */
export function normalizeSiteUrl(raw: string): string {
  let url: URL;
  try {
    url = new URL(/^https?:\/\//i.test(raw.trim()) ? raw.trim() : `http://${raw.trim()}`);
  } catch {
    throw new BadRequestException('사이트 주소가 올바르지 않습니다.');
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') throw new BadRequestException('http(s) 주소만 가져올 수 있습니다.');
  return `${url.protocol}//${url.host}`;
}

/**
 * 워드프레스 REST API(?rest_route=) 로 카테고리·글을 읽는다.
 * 고유주소 설정과 상관없이 동작하도록 /wp-json 대신 ?rest_route= 를 쓴다.
 */
@Injectable()
export class WordpressSource {
  async listCategories(sourceUrl: string): Promise<{ id: number; name: string; count: number }[]> {
    const site = normalizeSiteUrl(sourceUrl);
    const out: { id: number; name: string; count: number }[] = [];
    for (let page = 1; page <= 10; page++) {
      const { body, totalPages } = await this.get<{ id: number; name: string; count: number }[]>(site, '/wp/v2/categories', {
        per_page: '100',
        page: String(page),
      });
      out.push(...body.map(c => ({ id: c.id, name: decode(c.name), count: c.count })));
      if (page >= totalPages) break;
    }
    return out;
  }

  async listPosts(sourceUrl: string, categoryIds: number[], page: number, perPage: number): Promise<{ posts: WordpressPost[]; totalPages: number }> {
    const site = normalizeSiteUrl(sourceUrl);
    const { body, totalPages } = await this.get<
      { id: number; date: string; date_gmt: string; categories: number[]; title: { rendered: string }; content: { rendered: string } }[]
    >(site, '/wp/v2/posts', {
      categories: categoryIds.join(','),
      orderby: 'date',
      order: 'asc',
      per_page: String(perPage),
      page: String(page),
      _fields: 'id,date,date_gmt,categories,title,content',
    });
    return {
      totalPages,
      posts: body.map(p => ({
        id: p.id,
        date: p.date,
        dateGmt: p.date_gmt,
        categories: p.categories,
        title: p.title?.rendered ?? '',
        content: p.content?.rendered ?? '',
      })),
    };
  }

  private async get<T>(site: string, route: string, params: Record<string, string>): Promise<{ body: T; totalPages: number }> {
    const qs = new URLSearchParams({ rest_route: route, ...params });
    const res = await fetch(`${site}/?${qs.toString()}`, {
      headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    // 쪽 범위를 넘으면 워드프레스는 400(rest_post_invalid_page_number)을 준다 — 빈 쪽으로 본다
    if (res.status === 400 && Number(params.page) > 1) return { body: [] as T, totalPages: Number(params.page) - 1 };
    if (!res.ok) throw new BadRequestException(`워드프레스 사이트를 읽지 못했습니다 (${res.status}). 워드프레스 사이트가 맞는지 확인해 주세요.`);
    const body = (await res.json().catch(() => null)) as T | null;
    if (!Array.isArray(body)) throw new BadRequestException('워드프레스 REST API 응답이 아닙니다.');
    return { body, totalPages: Number(res.headers.get('x-wp-totalpages') ?? '1') || 1 };
  }
}

function decode(s: string): string {
  return s.replace(/&amp;/g, '&').replace(/&#0?38;/g, '&');
}
