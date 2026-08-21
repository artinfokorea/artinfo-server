import { TrendArchiveService, addDays, kstDate } from './trend-archive.service';

/** 최소 동작의 인메모리 Redis (hash 명령 + pipeline) */
function fakeRedis() {
  const store = new Map<string, Map<string, string>>();
  const hgetall = async (key: string) => Object.fromEntries(store.get(key) ?? []);
  const kv = new Map<string, string>();
  const client: any = {
    set: async (k: string, v: string) => void kv.set(k, v),
    mget: async (...keys: string[]) => keys.map(k => kv.get(k) ?? null),
    hmget: async (key: string, ...fields: string[]) => fields.map(f => store.get(key)?.get(f) ?? null),
    hgetall,
    pipeline() {
      const ops: (() => Promise<any>)[] = [];
      const p: any = {
        hset: (key: string, field: string, value: string) => {
          ops.push(async () => {
            if (!store.has(key)) store.set(key, new Map());
            store.get(key)!.set(field, value);
          });
          return p;
        },
        expire: () => p,
        hgetall: (key: string) => {
          ops.push(() => hgetall(key));
          return p;
        },
        exec: async () => {
          const out: [null, any][] = [];
          for (const op of ops) out.push([null, await op()]);
          return out;
        },
      };
      return p;
    },
  };
  return { redisClient: client, store };
}

/** DB 없는 환경용 스텁 — 과거 날짜도 Redis 폴백으로 읽게 한다 */
const dailyStub: any = {
  findRange: async () => new Map(),
  findHourlyTop: async () => [],
  upsertDay: jest.fn(async () => undefined),
};
const summaryStub: any = { findNearest: async () => new Map() };
const make = (redis: any) => new TrendArchiveService(redis, dailyStub, summaryStub);

describe('TrendArchiveService', () => {
  it('매분 표본을 누적해 최고 순위·체류·점수를 집계한다', async () => {
    const redis = fakeRedis();
    const svc = make(redis);
    const t0 = new Date('2026-08-21T01:00:00+09:00');
    const at = (min: number) => new Date(t0.getTime() + min * 60_000);

    await svc.record([{ rank: 1, keyword: 'A' }, { rank: 2, keyword: 'B' }], at(0));
    await svc.record([{ rank: 2, keyword: 'A' }, { rank: 1, keyword: 'B' }], at(1));
    await svc.record([{ rank: 3, keyword: 'B' }, { rank: 1, keyword: 'C' }], at(2));

    const res = await svc.getArchive('2026-08-21', '2026-08-21', 20);
    expect(res.days).toEqual([{ date: '2026-08-21', hasData: true }]);
    // B: 19+20+18=57, A: 20+19=39, C: 20
    expect(res.items.map(i => [i.keyword, i.score, i.peak, i.samples])).toEqual([
      ['B', 57, 1, 3],
      ['A', 39, 1, 2],
      ['C', 20, 1, 1],
    ]);
    expect(res.items[0].rank).toBe(1);
    expect(res.items[0].peakAt).toBe(at(1).toISOString());
    expect(res.hourlyTop).toEqual([{ hour: 1, keyword: 'C' }]);
  });

  it('여러 날을 합산하고 날짜별 데이터 유무를 돌려준다', async () => {
    const redis = fakeRedis();
    const svc = make(redis);
    await svc.record([{ rank: 1, keyword: 'A' }], new Date('2026-08-18T10:00:00+09:00'));
    await svc.record([{ rank: 5, keyword: 'A' }, { rank: 1, keyword: 'Z' }], new Date('2026-08-20T10:00:00+09:00'));

    const res = await svc.getArchive('2026-08-17', '2026-08-20', 10);
    expect(res.days.map(d => d.hasData)).toEqual([false, true, false, true]);
    const a = res.items.find(i => i.keyword === 'A')!;
    expect(a.days).toBe(2);
    expect(a.score).toBe(36);
    expect(a.peak).toBe(1);
    expect(res.hourlyTop).toEqual([]);
  });

  it('자정 경계는 KST 기준으로 나눈다', async () => {
    const redis = fakeRedis();
    const svc = make(redis);
    await svc.record([{ rank: 1, keyword: 'A' }], new Date('2026-08-21T23:59:00+09:00'));
    await svc.record([{ rank: 1, keyword: 'A' }], new Date('2026-08-22T00:01:00+09:00'));
    expect((await svc.getArchive('2026-08-21', '2026-08-21', 5)).items[0].samples).toBe(1);
    expect((await svc.getArchive('2026-08-22', '2026-08-22', 5)).items[0].samples).toBe(1);
  });

  it('31일 초과·역순 기간은 거부한다', async () => {
    const svc = make(fakeRedis());
    await expect(svc.getArchive('2026-08-01', '2026-09-01', 5)).rejects.toThrow();
    await expect(svc.getArchive('2026-08-02', '2026-08-01', 5)).rejects.toThrow();
  });

  it('DB에 요약이 없으면 Redis 요약 캐시를 붙인다', async () => {
    const redis = fakeRedis();
    const svc = make(redis);
    await svc.record([{ rank: 1, keyword: '손흥민' }], new Date('2026-08-21T10:00:00+09:00'));
    await redis.redisClient.set('trend:summary:v2:kr:10:손흥민', JSON.stringify({ headline: 'H', summary: 'S', bullets: ['b'], people: [], generatedAt: 'T' }));
    const res = await svc.getArchive('2026-08-21', '2026-08-21', 5);
    expect(res.items[0].summary).toEqual({ headline: 'H', summary: 'S', bullets: ['b'], people: [], generatedAt: 'T' });
  });

  it('롤업은 Redis 하루치를 DB upsert로 넘긴다', async () => {
    const redis = fakeRedis();
    const svc = make(redis);
    await svc.record([{ rank: 1, keyword: 'A' }, { rank: 4, keyword: 'B' }], new Date('2026-08-21T10:00:00+09:00'));
    expect(await svc.rollupDay('2026-08-21')).toBe(2);
    expect(dailyStub.upsertDay).toHaveBeenCalledWith(
      '2026-08-21',
      expect.arrayContaining([expect.objectContaining({ keyword: 'A', peak: 1, score: 20 })]),
      [{ hour: 10, keyword: 'A' }],
    );
    expect(await svc.rollupDay('2026-08-20')).toBe(0);
  });

  it('날짜 유틸', () => {
    expect(addDays('2026-08-31', 1)).toBe('2026-09-01');
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
    expect(kstDate(new Date('2026-08-21T15:30:00Z'))).toBe('2026-08-22');
  });
});
