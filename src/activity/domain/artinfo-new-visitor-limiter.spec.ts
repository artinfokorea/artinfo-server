import { ArtinfoNewVisitorLimiter } from '@/activity/domain/artinfo-new-visitor-limiter';
import { ARTINFO_ACTIVITY_MAX_NEW_VISITORS_PER_IP, ARTINFO_ACTIVITY_MAX_NEW_VISITORS_PER_UA } from '@/activity/domain/artinfo-activity-policy';

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

  describe('같은 User-Agent 당 10분 상한 — IP 를 바꿔 가며 도는 크롤러', () => {
    const ua = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36';

    it('UA 를 모르면 항상 허용', async () => {
      const { limiter } = build();
      await expect(limiter.allowByUserAgent(undefined, vid(1))).resolves.toBe(true);
    });

    it('같은 UA 에서 30번째 새 방문자까지 허용, 31번째부터 거절', async () => {
      const { limiter } = build();
      for (let i = 1; i <= ARTINFO_ACTIVITY_MAX_NEW_VISITORS_PER_UA; i++) {
        await expect(limiter.allowByUserAgent(ua, vid(i))).resolves.toBe(true);
      }
      await expect(limiter.allowByUserAgent(ua, vid(31))).resolves.toBe(false);
      await expect(limiter.allowByUserAgent(ua, vid(1))).resolves.toBe(true);
    });

    it('UA 가 한 글자라도 다르면 따로 센다', async () => {
      const { limiter } = build();
      for (let i = 1; i <= 30; i++) await limiter.allowByUserAgent(ua, vid(i));
      await expect(limiter.allowByUserAgent(`${ua} Edg/142.0`, vid(99))).resolves.toBe(true);
    });

    it('데스크톱 Linux 가 아닌 UA(iPhone Safari·카카오톡 인앱·Windows Chrome·크롬북)는 몇 명이 와도 상한이 없다 — 발송 직후 수백 명이 같은 UA 로 들어온다', async () => {
      const { limiter } = build();
      const uas = [
        'Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Mobile/15E148 Safari/604.1',
        'Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 KAKAOTALK 11.2.0',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',
        'Mozilla/5.0 (X11; CrOS x86_64 14541.0.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Linux; Android 14; SM-S928N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36',
      ];
      for (const u of uas) {
        for (let i = 1; i <= 200; i++) await expect(limiter.allowByUserAgent(u, vid(i))).resolves.toBe(true);
      }
    });

    it('UA 버킷 키는 10분 뒤 사라지고, 상한에 걸리면 로그 표식을 한 번만 남긴다', async () => {
      const { limiter, redis } = build();
      for (let i = 1; i <= 32; i++) await limiter.allowByUserAgent(ua, vid(i));
      const keys = [...redis.sets.keys()];
      expect(keys.some(k => k.startsWith('ACTIVITY:NEWVIS:UA:') && !k.endsWith(':logged'))).toBe(true);
      expect(keys.filter(k => k.endsWith(':logged'))).toHaveLength(1);
      expect([...redis.expires.values()]).toEqual([600, 600]);
    });
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
