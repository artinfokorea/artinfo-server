import { ArtinfoPushRepository } from '@/push/artinfo-push.repository';
import { ArtinfoPushService } from '@/push/artinfo-push.service';

/**
 * 기대값
 * - 채용 요약(sendJobDigest): 어제(한국 날짜) 등록된 활성 공고 수를 세서 0건이면 아무것도 보내지 않는다.
 *   1건 이상이면 채용 알림을 켜 둔 회원 전원에게 제목 "새로 올라온 채용 공고", 본문에 건수, data { type: 'jobs' } 로 보낸다.
 * - 테스트(sendJobDigestTest): 같은 채용 요약 문구를 ADMIN 이면 관리자 기기, ALL 이면 채용 알림 대상 전원에게 보낸다.
 *   전달 확인용이라 0건이어도 보내며, 그때 본문은 "어제 새로 등록된 채용 공고가 없어요."
 * - 공통: 100개씩 끊어 보내고, Expo 토큰 형식이 아닌 값·중복은 거른다. 대상이 없으면 Expo 를 호출하지 않는다.
 *   응답에 DeviceNotRegistered 가 있으면 그 토큰을 지운다. 결과로 발송 요청한 기기 수를 돌려준다.
 */
describe('ArtinfoPushService', () => {
  const repository = {
    countJobsCreatedYesterday: jest.fn(),
    scanJobPushTokens: jest.fn(),
    scanAdminTokens: jest.fn(),
    deleteTokens: jest.fn().mockResolvedValue(undefined),
  };
  const fetchMock = jest.fn();
  const service = new ArtinfoPushService(repository as unknown as ArtinfoPushRepository);
  const okResponse = (data: { status: string; details?: { error?: string } }[]) => ({ ok: true, status: 200, json: async () => ({ data }) });
  const digest = (to: string, body: string) => ({ to, title: '새로 올라온 채용 공고', body, data: { type: 'jobs' }, sound: 'default' });

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = fetchMock as unknown as typeof fetch;
  });

  it('sendJobDigest — 새 공고가 없으면 대상 조회도 발송도 하지 않는다', async () => {
    repository.countJobsCreatedYesterday.mockResolvedValue(0);
    await expect(service.sendJobDigest()).resolves.toEqual({ jobCount: 0, sent: 0 });
    expect(repository.countJobsCreatedYesterday).toHaveBeenCalledTimes(1);
    expect(repository.scanJobPushTokens).not.toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('sendJobDigest — 새 공고가 있으면 건수를 담아 채용 알림 대상 전원에게 보낸다', async () => {
    repository.countJobsCreatedYesterday.mockResolvedValue(5);
    repository.scanJobPushTokens.mockResolvedValue(['ExponentPushToken[a]', 'ExponentPushToken[b]']);
    fetchMock.mockResolvedValue(okResponse([{ status: 'ok' }, { status: 'ok' }]));

    await expect(service.sendJobDigest()).resolves.toEqual({ jobCount: 5, sent: 2 });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('https://exp.host/--/api/v2/push/send');
    expect(JSON.parse(init.body)).toEqual([
      digest('ExponentPushToken[a]', '어제 새로 등록된 채용 공고 5건을 확인해 보세요.'),
      digest('ExponentPushToken[b]', '어제 새로 등록된 채용 공고 5건을 확인해 보세요.'),
    ]);
    expect(repository.deleteTokens).not.toHaveBeenCalled();
  });

  it('sendJobDigestTest(ADMIN) — 관리자 기기에만 스케줄과 같은 채용 요약 문구로 보낸다', async () => {
    repository.countJobsCreatedYesterday.mockResolvedValue(3);
    repository.scanAdminTokens.mockResolvedValue(['ExponentPushToken[admin]']);
    fetchMock.mockResolvedValue(okResponse([{ status: 'ok' }]));

    await expect(service.sendJobDigestTest('ADMIN')).resolves.toEqual({ jobCount: 3, sent: 1 });
    expect(repository.scanJobPushTokens).not.toHaveBeenCalled();
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual([digest('ExponentPushToken[admin]', '어제 새로 등록된 채용 공고 3건을 확인해 보세요.')]);
  });

  it('sendJobDigestTest(ALL) — 실제 발송 대상(채용 알림 켠 회원)에게 보내고, 0건이어도 보낸다', async () => {
    repository.countJobsCreatedYesterday.mockResolvedValue(0);
    repository.scanJobPushTokens.mockResolvedValue(['ExponentPushToken[a]']);
    fetchMock.mockResolvedValue(okResponse([{ status: 'ok' }]));

    await expect(service.sendJobDigestTest('ALL')).resolves.toEqual({ jobCount: 0, sent: 1 });
    expect(repository.scanAdminTokens).not.toHaveBeenCalled();
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual([digest('ExponentPushToken[a]', '어제 새로 등록된 채용 공고가 없어요.')]);
  });

  it('대상이 없으면 Expo 를 호출하지 않고 0 을 돌려준다', async () => {
    repository.countJobsCreatedYesterday.mockResolvedValue(2);
    repository.scanAdminTokens.mockResolvedValue([]);
    await expect(service.sendJobDigestTest('ADMIN')).resolves.toEqual({ jobCount: 2, sent: 0 });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('Expo 토큰 형식이 아닌 값과 중복은 거르고, 100개 단위로 나눠 보낸다', async () => {
    const tokens = Array.from({ length: 150 }, (_, i) => `ExponentPushToken[${i}]`);
    repository.countJobsCreatedYesterday.mockResolvedValue(1);
    repository.scanJobPushTokens.mockResolvedValue([...tokens, 'garbage', 'ExponentPushToken[0]']);
    fetchMock.mockImplementation(async (_url: string, init: { body: string }) => okResponse(JSON.parse(init.body).map(() => ({ status: 'ok' }))));

    await expect(service.sendJobDigest()).resolves.toEqual({ jobCount: 1, sent: 150 });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toHaveLength(100);
    expect(JSON.parse(fetchMock.mock.calls[1][1].body)).toHaveLength(50);
  });

  it('DeviceNotRegistered 토큰은 지운다', async () => {
    repository.countJobsCreatedYesterday.mockResolvedValue(1);
    repository.scanJobPushTokens.mockResolvedValue(['ExponentPushToken[live]', 'ExponentPushToken[dead]']);
    fetchMock.mockResolvedValue(okResponse([{ status: 'ok' }, { status: 'error', details: { error: 'DeviceNotRegistered' } }]));

    await service.sendJobDigest();
    expect(repository.deleteTokens).toHaveBeenCalledWith(['ExponentPushToken[dead]']);
  });

  it('Expo 가 HTTP 오류를 주면 그 묶음은 건너뛰고 예외를 던지지 않는다', async () => {
    repository.countJobsCreatedYesterday.mockResolvedValue(1);
    repository.scanJobPushTokens.mockResolvedValue(['ExponentPushToken[a]']);
    fetchMock.mockResolvedValue({ ok: false, status: 500, json: async () => ({}) });
    await expect(service.sendJobDigest()).resolves.toEqual({ jobCount: 1, sent: 1 });
    expect(repository.deleteTokens).not.toHaveBeenCalled();
  });
});
