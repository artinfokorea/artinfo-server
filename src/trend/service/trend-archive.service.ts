import { Injectable, Logger } from '@nestjs/common';
import { RedisRepository } from '@/common/redis/redis-repository.service';
import { TrendArchiveRangeTooWide } from '@/trend/exception/trend.exception';
import { DailyKeywordRow, TrendDailyRepository } from '@/trend/repository/trend-daily.repository';
import { StoredSummary, TrendSummaryRepository } from '@/trend/repository/trend-summary.repository';
import { summaryCacheKey } from '@/trend/service/trend.service';
import { TrendSummaryResponse } from '@/trend/dto/response/trend-summary.response';
import { parseReactionCounts, reactionsCacheKey } from '@/trend/service/trend-reaction.service';

/**
 * 실시간 검색어 순위 히스토리 — 결산 페이지용
 *
 * 1) 누적: 매분 스케줄러가 통합 순위를 Redis 해시에 일자별(KST)로 쌓는다 (표본 1개 = 1분)
 *      trend:archive:v1:{YYYY-MM-DD}         HASH keyword → ArchiveEntry(JSON)
 *      trend:archive:v1:{YYYY-MM-DD}:hourly  HASH "HH" → 해당 시각대 마지막 표본의 1위
 * 2) 확정: 매일 00:10 KST 롤업이 어제(및 최근 며칠)치를 Postgres에 저장한다 (rollupDay)
 * 3) 조회: 오늘은 Redis, 지난 날짜는 DB(없으면 Redis 폴백). 키워드별로 최고 순위 시각에 가장 가까운 AI 요약을 붙인다
 */
export interface ArchiveEntry {
  peak: number;
  peakAt: string;
  firstSeen: string;
  lastSeen: string;
  samples: number;
  score: number;
}

export interface ArchiveItem extends ArchiveEntry {
  rank: number;
  keyword: string;
  days: number;
  summary: StoredSummary | null;
  /** 이슈 반응 투표 누적 — 투표가 없으면 null */
  reactions: Record<string, number> | null;
}

export interface ArchiveResult {
  from: string;
  to: string;
  days: { date: string; hasData: boolean }[];
  items: ArchiveItem[];
  hourlyTop: { hour: number; keyword: string }[];
  generatedAt: string;
}

const KEY_PREFIX = 'trend:archive:v1';
const MAX_RANK = 20;
const REDIS_RETENTION_SEC = 40 * 24 * 60 * 60; // DB 롤업 후 폴백용으로만 보관
export const MAX_RANGE_DAYS = 31;
const TZ = 'Asia/Seoul';

export function kstDate(d: Date): string {
  return d.toLocaleDateString('sv-SE', { timeZone: TZ });
}
function kstHour(d: Date): number {
  return Number(d.toLocaleString('en-US', { timeZone: TZ, hour: '2-digit', hour12: false }).slice(0, 2)) % 24;
}
export function addDays(date: string, n: number): string {
  const [y, m, d] = date.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d + n, 12)).toISOString().slice(0, 10);
}
function daysBetween(from: string, to: string): number {
  const p = (s: string) => {
    const [y, m, d] = s.split('-').map(Number);
    return Date.UTC(y, m - 1, d);
  };
  return Math.round((p(to) - p(from)) / 86_400_000);
}

@Injectable()
export class TrendArchiveService {
  private readonly logger = new Logger(TrendArchiveService.name);

  constructor(
    private readonly redis: RedisRepository,
    private readonly daily: TrendDailyRepository,
    private readonly summaries: TrendSummaryRepository,
  ) {}

  /** 현재 통합 순위 한 표본을 오늘 날짜에 누적 */
  async record(items: { rank: number; keyword: string }[], now = new Date()): Promise<void> {
    const valid = items.filter(i => Number.isInteger(i.rank) && i.rank >= 1 && i.rank <= MAX_RANK && i.keyword?.trim());
    if (valid.length === 0) return;

    const key = `${KEY_PREFIX}:${kstDate(now)}`;
    const iso = now.toISOString();
    const client = this.redis.redisClient;

    const keywords = valid.map(i => i.keyword.trim());
    const existing = await client.hmget(key, ...keywords);

    const pipe = client.pipeline();
    valid.forEach((item, idx) => {
      const prev = existing[idx] ? (JSON.parse(existing[idx] as string) as ArchiveEntry) : null;
      const points = MAX_RANK + 1 - item.rank;
      const next: ArchiveEntry = prev
        ? {
            peak: Math.min(prev.peak, item.rank),
            peakAt: item.rank < prev.peak ? iso : prev.peakAt,
            firstSeen: prev.firstSeen,
            lastSeen: iso,
            samples: prev.samples + 1,
            score: prev.score + points,
          }
        : { peak: item.rank, peakAt: iso, firstSeen: iso, lastSeen: iso, samples: 1, score: points };
      pipe.hset(key, keywords[idx], JSON.stringify(next));
    });
    pipe.expire(key, REDIS_RETENTION_SEC);

    const top = valid.find(i => i.rank === 1);
    if (top) {
      pipe.hset(`${key}:hourly`, String(kstHour(now)).padStart(2, '0'), top.keyword.trim());
      pipe.expire(`${key}:hourly`, REDIS_RETENTION_SEC);
    }
    await pipe.exec();
  }

  /** Redis 누적분을 DB에 확정 저장 — 저장한 키워드 수 반환 (Redis에 없으면 0, DB는 건드리지 않음) */
  async rollupDay(date: string): Promise<number> {
    const { rows, hourlyTop } = await this.readRedisDay(date);
    if (rows.length === 0) return 0;
    // 이슈 반응 투표는 키워드 단위 누적(14일 TTL)이라 롤업 시점 스냅샷을 함께 확정 저장한다
    const reactions = await this.readReactions(rows.map(r => r.keyword));
    rows.forEach(r => (r.reactions = reactions.get(r.keyword) ?? null));
    await this.daily.upsertDay(date, rows, hourlyTop);
    this.logger.log(`결산 롤업 ${date}: 키워드 ${rows.length}개, 시각대 ${hourlyTop.length}개`);
    return rows.length;
  }

  /** 기간(from~to, 양끝 포함) 집계 — 점수순 상위 limit개 + 요약 첨부 */
  async getArchive(from: string, to: string, limit: number): Promise<ArchiveResult> {
    const span = daysBetween(from, to);
    if (span < 0 || span + 1 > MAX_RANGE_DAYS) throw new TrendArchiveRangeTooWide();

    const today = kstDate(new Date());
    const dates: string[] = [];
    for (let i = 0; i <= span; i++) dates.push(addDays(from, i));

    // 지난 날짜는 DB 우선, 오늘(또는 아직 롤업 안 된 날)은 Redis
    const dbDays = await this.daily.findRange(from, to < today ? to : addDays(today, -1)).catch(e => {
      this.logger.warn(`DB 결산 조회 실패, Redis로 대체: ${(e as Error).message}`);
      return new Map<string, DailyKeywordRow[]>();
    });
    const perDay = await Promise.all(
      dates.map(async date => {
        const fromDb = date < today ? dbDays.get(date) : undefined;
        if (fromDb && fromDb.length > 0) return { date, rows: fromDb, source: 'db' as const };
        const { rows } = await this.readRedisDay(date);
        return { date, rows, source: 'redis' as const };
      }),
    );

    const merged = new Map<string, Omit<ArchiveItem, 'rank' | 'summary'>>();
    const days: ArchiveResult['days'] = [];
    for (const { date, rows } of perDay) {
      days.push({ date, hasData: rows.length > 0 });
      for (const e of rows) {
        const acc = merged.get(e.keyword);
        if (!acc) {
          merged.set(e.keyword, { ...e, reactions: e.reactions ?? null, days: 1 });
          continue;
        }
        acc.days += 1;
        acc.samples += e.samples;
        acc.score += e.score;
        // 반응 스냅샷은 키워드 단위 누적치라 날짜별 합산 대신 가장 나중 스냅샷을 쓴다 (중복 집계 방지)
        if (e.reactions) acc.reactions = e.reactions;
        if (e.peak < acc.peak || (e.peak === acc.peak && e.peakAt < acc.peakAt)) {
          acc.peak = e.peak;
          acc.peakAt = e.peakAt;
        }
        if (e.firstSeen < acc.firstSeen) acc.firstSeen = e.firstSeen;
        if (e.lastSeen > acc.lastSeen) acc.lastSeen = e.lastSeen;
      }
    }

    const top = [...merged.values()]
      .sort((a, b) => b.score - a.score || a.peak - b.peak || a.firstSeen.localeCompare(b.firstSeen))
      .slice(0, limit);

    const nearest = await this.summaries
      .findNearest(top.map(t => ({ keyword: t.keyword, at: t.peakAt })))
      .catch(e => {
        this.logger.warn(`요약 첨부 실패: ${(e as Error).message}`);
        return new Map<string, StoredSummary>();
      });
    // DB에 없으면(테이블 미생성·이력 저장 전) 살아 있는 Redis 요약 캐시라도 붙인다 — 상위권은 선생성되어 대부분 있다
    const missing = top.filter(t => !nearest.has(t.keyword));
    if (missing.length > 0) {
      const cached = await this.redis.redisClient.mget(...missing.map(t => summaryCacheKey('kr', t.keyword))).catch(() => []);
      missing.forEach((t, i) => {
        const raw = cached[i];
        if (!raw) return;
        try {
          const r = JSON.parse(raw) as TrendSummaryResponse;
          nearest.set(t.keyword, {
            headline: r.headline,
            summary: r.summary,
            bullets: r.bullets ?? [],
            people: r.people ?? [],
            generatedAt: r.generatedAt,
          });
        } catch {
          /* 손상된 캐시는 무시 */
        }
      });
    }
    // 오늘이 포함된 조회는 아직 롤업 전이므로 살아 있는 Redis 반응 카운트로 덮어쓴다
    if (to >= today) {
      const live = await this.readReactions(top.map(t => t.keyword)).catch(() => new Map<string, Record<string, number>>());
      for (const t of top) {
        const r = live.get(t.keyword);
        if (r) t.reactions = r;
      }
    }

    const items: ArchiveItem[] = top.map((t, i) => ({ ...t, rank: i + 1, summary: nearest.get(t.keyword) ?? null }));

    let hourlyTop: ArchiveResult['hourlyTop'] = [];
    if (from === to) {
      const single = perDay[0];
      hourlyTop = single.source === 'db' ? await this.daily.findHourlyTop(from) : (await this.readRedisDay(from)).hourlyTop;
    }

    return { from, to, days, items, hourlyTop, generatedAt: new Date().toISOString() };
  }

  /** 키워드별 이슈 반응 카운트를 한 번의 파이프라인으로 조회 — 투표 없는 키워드는 결과에서 제외 */
  private async readReactions(keywords: string[]): Promise<Map<string, Record<string, number>>> {
    const out = new Map<string, Record<string, number>>();
    if (keywords.length === 0) return out;
    const pipe = this.redis.redisClient.pipeline();
    keywords.forEach(k => pipe.hgetall(reactionsCacheKey(k)));
    const res = await pipe.exec();
    keywords.forEach((k, i) => {
      const counts = parseReactionCounts(res?.[i]?.[1] as Record<string, string> | undefined);
      if (counts) out.set(k, counts);
    });
    return out;
  }

  private async readRedisDay(date: string): Promise<{ rows: DailyKeywordRow[]; hourlyTop: { hour: number; keyword: string }[] }> {
    const client = this.redis.redisClient;
    const [hash, hourly] = await Promise.all([client.hgetall(`${KEY_PREFIX}:${date}`), client.hgetall(`${KEY_PREFIX}:${date}:hourly`)]);
    const rows: DailyKeywordRow[] = [];
    for (const [keyword, json] of Object.entries(hash ?? {})) {
      try {
        rows.push({ keyword, ...(JSON.parse(json) as ArchiveEntry) });
      } catch {
        /* 손상된 항목은 건너뜀 */
      }
    }
    const hourlyTop = Object.entries(hourly ?? {})
      .map(([h, keyword]) => ({ hour: Number(h), keyword }))
      .sort((a, b) => a.hour - b.hour);
    return { rows, hourlyTop };
  }
}
