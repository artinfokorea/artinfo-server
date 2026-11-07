import { ArtinfoPushController } from '@/push/artinfo-push.controller';
import { ArtinfoPushRepository } from '@/push/artinfo-push.repository';

/**
 * 기대값: 앱 푸시 토큰·설정 API
 * - POST /push-tokens: 로그인한 회원 ID 로 이 기기 토큰을 등록한다(공백 제거, 플랫폼 기본 ios).
 * - DELETE /push-tokens: 로그아웃 — 이 기기 토큰만 지운다.
 * - GET /push-preferences: 저장한 적 없으면 { job: true }.
 * - PUT /push-preferences: 보낸 항목만 바꾸고 전체를 돌려준다.
 */
describe('ArtinfoPushController', () => {
  const repository = {
    upsertToken: jest.fn().mockResolvedValue(undefined),
    deleteToken: jest.fn().mockResolvedValue(undefined),
    findPreferences: jest.fn(),
    savePreferences: jest.fn().mockResolvedValue(undefined),
  };
  const controller = new ArtinfoPushController(repository as unknown as ArtinfoPushRepository);
  const me = { id: 7, name: '나', email: 'me@example.com' };

  beforeEach(() => jest.clearAllMocks());

  it('register — 회원 ID 와 토큰(공백 제거)·플랫폼을 저장한다', async () => {
    await controller.register(me, { token: ' ExponentPushToken[abc] ' });
    expect(repository.upsertToken).toHaveBeenCalledWith(7, 'ExponentPushToken[abc]', 'ios');
    await controller.register(me, { token: 'ExponentPushToken[abc]', platform: 'android' });
    expect(repository.upsertToken).toHaveBeenLastCalledWith(7, 'ExponentPushToken[abc]', 'android');
  });

  it('unregister — 토큰으로 지운다', async () => {
    await controller.unregister(me, { token: 'ExponentPushToken[abc]' });
    expect(repository.deleteToken).toHaveBeenCalledWith('ExponentPushToken[abc]');
  });

  it('getPreferences — 저장 전엔 기본값(켜짐)', async () => {
    repository.findPreferences.mockResolvedValue(null);
    await expect(controller.getPreferences(me)).resolves.toEqual({ code: 'OK', message: null, item: { job: true } });
    repository.findPreferences.mockResolvedValue({ job: false });
    await expect(controller.getPreferences(me)).resolves.toEqual({ code: 'OK', message: null, item: { job: false } });
  });

  it('updatePreferences — 보낸 항목만 바꾸고 저장한 뒤 전체를 돌려준다', async () => {
    repository.findPreferences.mockResolvedValue(null);
    await expect(controller.updatePreferences(me, { job: false })).resolves.toEqual({ code: 'OK', message: null, item: { job: false } });
    expect(repository.savePreferences).toHaveBeenCalledWith(7, { job: false });

    repository.findPreferences.mockResolvedValue({ job: false });
    await expect(controller.updatePreferences(me, {})).resolves.toEqual({ code: 'OK', message: null, item: { job: false } });
    expect(repository.savePreferences).toHaveBeenLastCalledWith(7, { job: false });
  });
});
