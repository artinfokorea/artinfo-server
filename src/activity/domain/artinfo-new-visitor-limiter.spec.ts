import { ArtinfoNewVisitorLimiter } from '@/activity/domain/artinfo-new-visitor-limiter';
import { ARTINFO_ACTIVITY_MAX_NEW_VISITORS_PER_IP } from '@/activity/domain/artinfo-activity-policy';

/** ioredis 의 SET 명령 네 개만 흉내 낸 가짜 (키별 Set) */
class FakeRedis {
  sets = new Map<string, Set<string>>();
  expires = new Map<string, number>();
  async sismember(key: string, member: string) {
    return this.sets.get(key)?.has(member) ? 1 : 0;
  }
  async scard(key: string) {
    return this.sets.get(key)?.size ?? 0;
  }
  async sadd(key: string, member: string) {
    const set = this.sets.get(key) ?? new Set<string>();
    const added = set.has(member) ? 0 : 1;
    set.add(member);
    this.sets.set(key, set);
    return added;
  }
  async expire(key: string, seconds: number) {
    this.expires.set(key, seconds);
    return 1;
  }
}

const vid = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;

function build(redis: unknown = new FakeRedis()) {
  const limiter = new ArtinfoNewVisitorLimiter({ redisClient: redis } as any);
  return { limiter, redis: redis as FakeRedis };
}

describe('ArtinfoNewVisitorLimiter', () => {
  it('IP 를 모르면(프록시가 X-Forwarded-For 를 안 줌) 항상 허용', async () => {
    const { limiter } = build();
    await expect(limiter.allow(null, vid(1))).resolves.toBe(true);
  });

  it('한 IP 에서 10번째 새 방문자까지 허용, 11번째부터 거절', async () => {
    const { limiter } = build();
    for (let i = 1; i <= ARTINFO_ACTIVITY_MAX_NEW_VISITORS_PER_IP; i++) {
      await expect(limiter.allow('203.0.113.7', vid(i))).resolves.toBe(true);
    }
    await expect(limiter.allow('203.0.113.7', vid(11))).resolves.toBe(false);
    await expect(limiter.allow('203.0.113.7', vid(12))).resolves.toBe(false);
  });

  it('이미 허용된 방문자의 후속 전송은 상한을 넘은 뒤에도 계속 허용 (체류시간 누적이 끊기지 않는다)', async () => {
    const { limiter } = build();
    for (let i = 1; i <= 10; i++) await limiter.allow('203.0.113.7', vid(i));
    await expect(limiter.allow('203.0.113.7', vid(11))).resolves.toBe(false);
    await expect(limiter.allow('203.0.113.7', vid(1))).resolves.toBe(true);
    await expect(limiter.allow('203.0.113.7', vid(10))).resolves.toBe(true);
  });

  it('거절된 방문자는 집합에 넣지 않는다', async () => {
    const { limiter, redis } = build();
    for (let i = 1; i <= 11; i++) await limiter.allow('203.0.113.7', vid(i));
    const [set] = [...redis.sets.values()];
    expect(set.size).toBe(10);
    expect(set.has(vid(11))).toBe(false);
  });

  it('다른 IP 는 따로 센다', async () => {
    const { limiter } = build();
    for (let i = 1; i <= 10; i++) await limiter.allow('203.0.113.7', vid(i));
    await expect(limiter.allow('198.51.100.9', vid(99))).resolves.toBe(true);
  });

  it('키는 1시간 뒤 사라진다 (첫 추가 때 TTL 설정)', async () => {
    const { limiter, redis } = build();
    await limiter.allow('203.0.113.7', vid(1));
    expect([...redis.expires.values()]).toEqual([3600]);
  });

  it('Redis 오류가 나면 허용한다 — 지표 보조 장치가 집계를 막으면 안 된다', async () => {
    const broken = {
      sismember: async () => {
        throw new Error('ECONNREFUSED');
      },
    };
    const { limiter } = build(broken);
    await expect(limiter.allow('203.0.113.7', vid(1))).resolves.toBe(true);
  });
});
