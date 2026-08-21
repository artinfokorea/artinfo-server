import { Injectable } from '@nestjs/common';
import { RedisRepository } from '@/common/redis/redis-repository.service';
import { TrendArchiveRangeTooWide } from '@/trend/exception/trend.exception';

/**
 * 실시간 검색어 순위 히스토리(일간 누적) — 결산 페이지용
 *
 * 저장 구조 (Redis)
 *   trend:archive:v1:{YYYY-MM-DD}         HASH  keyword → ArchiveEntry(JSON)
 *   trend:archive:v1:{YYYY-MM-DD}:hourly  HASH  "HH"    → 해당 시각대 마지막 표본의 1위 키워드
 * 매분 스케줄러가 통합 순위를 한 번 기록한다(표본 1개 = 1분).
 */
export interface ArchiveEntry {
  peak: number; // 최고 순위 (작을수록 높음)
  peakAt: string; // 최고 순위 최초 도달 시각 (ISO)
  firstSeen: string;
  lastSeen: string;
  samples: number; // 차트 체류 표본 수 (≈ 분)
  score: number; // Σ (MAX_RANK + 1 - rank)
}

export interface ArchiveItem extends ArchiveEntry {
  rank: number;
  keyword: string;
  days: number; // 기간 내 차트에 오른 날 수
}

export interface ArchiveResult {
  from: string;
  to: string;
  days: { date: string; hasData: boolean }[];
  items: ArchiveItem[];
  hourlyTop: { hour: number; keyword: string }[]; // 단일 일자 조회에서만 채움
  generatedAt: string;
}

const KEY_PREFIX = 'trend:archive:v1';
const MAX_RANK = 20;
const RETENTION_SEC = 400 * 24 * 60 * 60;
export const MAX_RANGE_DAYS = 31;
const TZ = 'Asia/Seoul';

/** Date → KST 기준 YYYY-MM-DD */
export function kstDate(d: Date): string {
  return d.toLocaleDateString('sv-SE', { timeZone: TZ });
}
function kstHour(d: Date): number {
  return Number(d.toLocaleString('en-US', { timeZone: TZ, hour: '2-digit', hour12: false }).slice(0, 2)) % 24;
}
/** YYYY-MM-DD 에 n일 더하기 (달력 기준) */
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
  constructor(private readonly redis: RedisRepository) {}

  /** 현재 통합 순위 한 표본을 오늘 날짜에 누적 */
  async record(items: { rank: number; keyword: string }[], now = new Date()): Promise<void> {
    const valid = items.filter(i => Number.isInteger(i.rank) && i.rank >= 1 && i.rank <= MAX_RANK && i.keyword?.trim());
    if (valid.length === 0) return;

    const date = kstDate(now);
    const key = `${KEY_PREFIX}:${date}`;
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
    pipe.expire(key, RETENTION_SEC);

    const top = valid.find(i => i.rank === 1);
    if (top) {
      const hourlyKey = `${key}:hourly`;
      pipe.hset(hourlyKey, String(kstHour(now)).padStart(2, '0'), top.keyword.trim());
      pipe.expire(hourlyKey, RETENTION_SEC);
    }
    await pipe.exec();
  }

  /** 기간(from~to, 양끝 포함) 집계 — 점수순 상위 limit개 */
  async getArchive(from: string, to: string, limit: number): Promise<ArchiveResult> {
    const span = daysBetween(from, to);
    if (span < 0 || span + 1 > MAX_RANGE_DAYS) throw new TrendArchiveRangeTooWide();

    const dates: string[] = [];
    for (let i = 0; i <= span; i++) dates.push(addDays(from, i));

    const client = this.redis.redisClient;
    const pipe = client.pipeline();
    dates.forEach(d => pipe.hgetall(`${KEY_PREFIX}:${d}`));
    const results = (await pipe.exec()) ?? [];

    const merged = new Map<string, ArchiveItem>();
    const days: ArchiveResult['days'] = [];
    results.forEach(([err, raw], idx) => {
      const hash = (err ? {} : (raw as Record<string, string>)) ?? {};
      const entries = Object.entries(hash);
      days.push({ date: dates[idx], hasData: entries.length > 0 });
      for (const [keyword, json] of entries) {
        let e: ArchiveEntry;
        try {
          e = JSON.parse(json);
        } catch {
          continue;
        }
        const acc = merged.get(keyword);
        if (!acc) {
          merged.set(keyword, { ...e, rank: 0, keyword, days: 1 });
        } else {
          acc.days += 1;
          acc.samples += e.samples;
          acc.score += e.score;
          if (e.peak < acc.peak || (e.peak === acc.peak && e.peakAt < acc.peakAt)) {
            acc.peak = e.peak;
            acc.peakAt = e.peakAt;
          }
          if (e.firstSeen < acc.firstSeen) acc.firstSeen = e.firstSeen;
          if (e.lastSeen > acc.lastSeen) acc.lastSeen = e.lastSeen;
        }
      }
    });

    const items = [...merged.values()]
      .sort((a, b) => b.score - a.score || a.peak - b.peak || a.firstSeen.localeCompare(b.firstSeen))
      .slice(0, limit)
      .map((item, i) => ({ ...item, rank: i + 1 }));

    let hourlyTop: ArchiveResult['hourlyTop'] = [];
    if (from === to) {
      const hourly = (await client.hgetall(`${KEY_PREFIX}:${from}:hourly`)) ?? {};
      hourlyTop = Object.entries(hourly)
        .map(([h, keyword]) => ({ hour: Number(h), keyword }))
        .sort((a, b) => a.hour - b.hour);
    }

    return { from, to, days, items, hourlyTop, generatedAt: new Date().toISOString() };
  }
}
