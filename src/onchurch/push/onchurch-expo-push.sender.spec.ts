import { OnchurchExpoPushSender } from '@/onchurch/push/onchurch-expo-push.sender';

/**
 * 기대: Expo 토큰 형식만, 중복 없이 보낸다. DeviceNotRegistered 티켓의 토큰은 stale 로 돌려준다. 보낼 토큰이 없으면 호출하지 않는다.
 */
describe('OnchurchExpoPushSender', () => {
  const message = { title: '새벽교회', body: '[공지] 안내', data: { type: 'notice', path: '/notices' } };
  const originalFetch = global.fetch;
  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('형식이 맞는 토큰만 중복 없이 보내고 죽은 토큰을 알려준다', async () => {
    const bodies: unknown[] = [];
    global.fetch = jest.fn(async (_url: string, init: { body: string }) => {
      bodies.push(JSON.parse(init.body));
      return {
        ok: true,
        json: async () => ({ data: [{ status: 'ok' }, { status: 'error', details: { error: 'DeviceNotRegistered' } }] }),
      };
    }) as unknown as typeof fetch;

    const result = await new OnchurchExpoPushSender().send(['ExponentPushToken[A]', 'ExponentPushToken[A]', 'bad-token', 'ExponentPushToken[B]'], message);

    expect(result).toEqual({ sent: 2, stale: ['ExponentPushToken[B]'] });
    expect(bodies).toEqual([
      [
        { to: 'ExponentPushToken[A]', title: '새벽교회', body: '[공지] 안내', data: { type: 'notice', path: '/notices' }, sound: 'default' },
        { to: 'ExponentPushToken[B]', title: '새벽교회', body: '[공지] 안내', data: { type: 'notice', path: '/notices' }, sound: 'default' },
      ],
    ]);
  });

  it('보낼 토큰이 없으면 호출하지 않는다', async () => {
    const fetchMock = jest.fn();
    global.fetch = fetchMock as unknown as typeof fetch;
    expect(await new OnchurchExpoPushSender().send(['bad'], message)).toEqual({ sent: 0, stale: [] });
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
