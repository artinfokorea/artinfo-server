import { ArtinfoPushRepository } from '@/push/artinfo-push.repository';
import { ArtinfoPushService } from '@/push/artinfo-push.service';

/**
 * 기대값: 채용 공고 등록 푸시
 * - 등록자 본인을 뺀 대상 토큰 전원에게 Expo Push API 로 보낸다. 제목 "새 채용 공고", 본문 "{회사명} · {공고 제목}",
 *   data { type: 'job', jobId } — 앱이 탭하면 공고 상세로 간다.
 * - 100개씩 끊어 보내고, Expo 토큰 형식이 아닌 값·중복은 거른다. 대상이 없으면 호출하지 않는다.
 * - 응답에 DeviceNotRegistered 가 있으면 그 토큰을 지운다.
 * - 발송은 fire-and-forget — 실패해도 등록 요청에는 영향이 없다(예외가 밖으로 새지 않는다).
 */
describe('ArtinfoPushService', () => {
  const repository = {
    scanTokensForJobPush: jest.fn(),
    deleteTokens: jest.fn().mockResolvedValue(undefined),
  };
  const fetchMock = jest.fn();
  const service = new ArtinfoPushService(repository as unknown as ArtinfoPushRepository);
  const flush = () => new Promise(resolve => setImmediate(resolve));
  const okResponse = (data: { status: string; details?: { error?: string } }[]) => ({ ok: true, status: 200, json: async () => ({ data }) });

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = fetchMock as unknown as typeof fetch;
  });

  it('notifyNewJob — 대상 토큰에 제목·본문·jobId 를 담아 보낸다', async () => {
    repository.scanTokensForJobPush.mockResolvedValue(['ExponentPushToken[a]', 'ExponentPushToken[b]']);
    fetchMock.mockResolvedValue(okResponse([{ status: 'ok' }, { status: 'ok' }]));

    service.notifyNewJob({ jobId: 31, title: '첼로 단원 모집', companyName: '서울시향', authorUserId: 7 });
    await flush();

    expect(repository.scanTokensForJobPush).toHaveBeenCalledWith(7);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('https://exp.host/--/api/v2/push/send');
    expect(JSON.parse(init.body)).toEqual([
      { to: 'ExponentPushToken[a]', title: '새 채용 공고', body: '서울시향 · 첼로 단원 모집', data: { type: 'job', jobId: '31' }, sound: 'default' },
      { to: 'ExponentPushToken[b]', title: '새 채용 공고', body: '서울시향 · 첼로 단원 모집', data: { type: 'job', jobId: '31' }, sound: 'default' },
    ]);
    expect(repository.deleteTokens).not.toHaveBeenCalled();
  });

  it('대상이 없으면 Expo 를 호출하지 않는다', async () => {
    repository.scanTokensForJobPush.mockResolvedValue([]);
    service.notifyNewJob({ jobId: 1, title: 't', companyName: 'c', authorUserId: 7 });
    await flush();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('Expo 토큰 형식이 아닌 값과 중복은 거르고, 100개 단위로 나눠 보낸다', async () => {
    const tokens = Array.from({ length: 150 }, (_, i) => `ExponentPushToken[${i}]`);
    repository.scanTokensForJobPush.mockResolvedValue([...tokens, 'garbage', 'ExponentPushToken[0]']);
    fetchMock.mockImplementation(async (_url: string, init: { body: string }) => okResponse(JSON.parse(init.body).map(() => ({ status: 'ok' }))));

    service.notifyNewJob({ jobId: 1, title: 't', companyName: 'c', authorUserId: 7 });
    await flush();

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toHaveLength(100);
    expect(JSON.parse(fetchMock.mock.calls[1][1].body)).toHaveLength(50);
  });

  it('DeviceNotRegistered 토큰은 지운다', async () => {
    repository.scanTokensForJobPush.mockResolvedValue(['ExponentPushToken[live]', 'ExponentPushToken[dead]']);
    fetchMock.mockResolvedValue(okResponse([{ status: 'ok' }, { status: 'error', details: { error: 'DeviceNotRegistered' } }]));

    service.notifyNewJob({ jobId: 1, title: 't', companyName: 'c', authorUserId: 7 });
    await flush();

    expect(repository.deleteTokens).toHaveBeenCalledWith(['ExponentPushToken[dead]']);
  });

  it('조회·발송이 실패해도 예외가 밖으로 새지 않는다', async () => {
    repository.scanTokensForJobPush.mockRejectedValue(new Error('db down'));
    expect(() => service.notifyNewJob({ jobId: 1, title: 't', companyName: 'c', authorUserId: 7 })).not.toThrow();
    await flush();

    repository.scanTokensForJobPush.mockResolvedValue(['ExponentPushToken[a]']);
    fetchMock.mockRejectedValue(new Error('network'));
    expect(() => service.notifyNewJob({ jobId: 1, title: 't', companyName: 'c', authorUserId: 7 })).not.toThrow();
    await flush();
  });
});
