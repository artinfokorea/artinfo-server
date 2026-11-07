import { ArtinfoPushRepository } from '@/push/artinfo-push.repository';
import { ArtinfoPushService, JOB_DIGEST_WINDOW_HOURS } from '@/push/artinfo-push.service';

/**
 * 기대값
 * - 채용 요약(sendJobDigest): 최근 24시간 활성 공고 수를 세서 0건이면 아무것도 보내지 않는다.
 *   1건 이상이면 채용 알림을 켜 둔 회원 전원에게 제목 "오늘의 채용 공고", 본문에 건수, data { type: 'jobs' } 로 보낸다.
 * - 테스트(sendTest): target(ADMIN/ALL) 토큰에 주어진 제목·본문, data { type: 'test' } 로 보낸다.
 * - 공통: 100개씩 끊어 보내고, Expo 토큰 형식이 아닌 값·중복은 거른다. 대상이 없으면 Expo 를 호출하지 않는다.
 *   응답에 DeviceNotRegistered 가 있으면 그 토큰을 지운다. 결과로 발송 요청한 기기 수를 돌려준다.
 */
describe('ArtinfoPushService', () => {
  const repository = {
    countJobsCreatedWithinHours: jest.fn(),
    scanJobPushTokens: jest.fn(),
    scanTokens: jest.fn(),
    deleteTokens: jest.fn().mockResolvedValue(undefined),
  };
  const fetchMock = jest.fn();
  const service = new ArtinfoPushService(repository as unknown as ArtinfoPushRepository);
  const okResponse = (data: { status: string; details?: { error?: string } }[]) => ({ ok: true, status: 200, json: async () => ({ data }) });

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = fetchMock as unknown as typeof fetch;
  });

  it('sendJobDigest — 새 공고가 없으면 대상 조회도 발송도 하지 않는다', async () => {
    repository.countJobsCreatedWithinHours.mockResolvedValue(0);
    await expect(service.sendJobDigest()).resolves.toEqual({ jobCount: 0, sent: 0 });
    expect(repository.countJobsCreatedWithinHours).toHaveBeenCalledWith(JOB_DIGEST_WINDOW_HOURS);
    expect(repository.scanJobPushTokens).not.toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('sendJobDigest — 새 공고가 있으면 건수를 담아 채용 알림 대상 전원에게 보낸다', async () => {
    repository.countJobsCreatedWithinHours.mockResolvedValue(5);
    repository.scanJobPushTokens.mockResolvedValue(['ExponentPushToken[a]', 'ExponentPushToken[b]']);
    fetchMock.mockResolvedValue(okResponse([{ status: 'ok' }, { status: 'ok' }]));

    await expect(service.sendJobDigest()).resolves.toEqual({ jobCount: 5, sent: 2 });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('https://exp.host/--/api/v2/push/send');
    expect(JSON.parse(init.body)).toEqual([
      {
        to: 'ExponentPushToken[a]',
        title: '오늘의 채용 공고',
        body: '오늘 새로 등록된 채용 공고 5건을 확인해 보세요.',
        data: { type: 'jobs' },
        sound: 'default',
      },
      {
        to: 'ExponentPushToken[b]',
        title: '오늘의 채용 공고',
        body: '오늘 새로 등록된 채용 공고 5건을 확인해 보세요.',
        data: { type: 'jobs' },
        sound: 'default',
      },
    ]);
    expect(repository.deleteTokens).not.toHaveBeenCalled();
  });

  it('sendTest — 대상 토큰에 주어진 제목·본문으로 보낸다', async () => {
    repository.scanTokens.mockResolvedValue(['ExponentPushToken[admin]']);
    fetchMock.mockResolvedValue(okResponse([{ status: 'ok' }]));

    await expect(service.sendTest('ADMIN', '테스트', '본문')).resolves.toEqual({ sent: 1 });
    expect(repository.scanTokens).toHaveBeenCalledWith('ADMIN');
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual([
      { to: 'ExponentPushToken[admin]', title: '테스트', body: '본문', data: { type: 'test' }, sound: 'default' },
    ]);
  });

  it('대상이 없으면 Expo 를 호출하지 않고 0 을 돌려준다', async () => {
    repository.scanTokens.mockResolvedValue([]);
    await expect(service.sendTest('ALL', 't', 'b')).resolves.toEqual({ sent: 0 });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('Expo 토큰 형식이 아닌 값과 중복은 거르고, 100개 단위로 나눠 보낸다', async () => {
    const tokens = Array.from({ length: 150 }, (_, i) => `ExponentPushToken[${i}]`);
    repository.scanTokens.mockResolvedValue([...tokens, 'garbage', 'ExponentPushToken[0]']);
    fetchMock.mockImplementation(async (_url: string, init: { body: string }) => okResponse(JSON.parse(init.body).map(() => ({ status: 'ok' }))));

    await expect(service.sendTest('ALL', 't', 'b')).resolves.toEqual({ sent: 150 });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toHaveLength(100);
    expect(JSON.parse(fetchMock.mock.calls[1][1].body)).toHaveLength(50);
  });

  it('DeviceNotRegistered 토큰은 지운다', async () => {
    repository.scanTokens.mockResolvedValue(['ExponentPushToken[live]', 'ExponentPushToken[dead]']);
    fetchMock.mockResolvedValue(okResponse([{ status: 'ok' }, { status: 'error', details: { error: 'DeviceNotRegistered' } }]));

    await service.sendTest('ALL', 't', 'b');
    expect(repository.deleteTokens).toHaveBeenCalledWith(['ExponentPushToken[dead]']);
  });

  it('Expo 가 HTTP 오류를 주면 그 묶음은 건너뛰고 예외를 던지지 않는다', async () => {
    repository.scanTokens.mockResolvedValue(['ExponentPushToken[a]']);
    fetchMock.mockResolvedValue({ ok: false, status: 500, json: async () => ({}) });
    await expect(service.sendTest('ALL', 't', 'b')).resolves.toEqual({ sent: 1 });
    expect(repository.deleteTokens).not.toHaveBeenCalled();
  });
});
