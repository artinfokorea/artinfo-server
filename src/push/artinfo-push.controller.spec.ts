import { ArtinfoPushController } from '@/push/artinfo-push.controller';
import { ArtinfoPushRepository } from '@/push/artinfo-push.repository';
import { ArtinfoPushService } from '@/push/artinfo-push.service';

/**
 * 기대값: 앱 푸시 토큰·설정 API
 * - POST /push-tokens: 로그인한 회원 ID 로 이 기기 토큰을 등록한다(공백 제거, 플랫폼 기본 ios).
 * - DELETE /push-tokens: 로그아웃 — 이 기기 토큰만 지운다.
 * - GET /push-preferences: 저장한 적 없으면 { job: true }.
 * - PUT /push-preferences: 보낸 항목만 바꾸고 전체를 돌려준다.
 * - POST /push/test (관리자): target 과 제목·본문(기본값 있음)으로 테스트 발송, 기기 수를 돌려준다.
 * - POST /push/digest (관리자): 채용 요약 푸시를 지금 보낸다.
 */
describe('ArtinfoPushController', () => {
  const repository = {
    upsertToken: jest.fn().mockResolvedValue(undefined),
    deleteToken: jest.fn().mockResolvedValue(undefined),
    findPreferences: jest.fn(),
    savePreferences: jest.fn().mockResolvedValue(undefined),
  };
  const pushService = {
    sendTest: jest.fn().mockResolvedValue({ sent: 2 }),
    sendJobDigest: jest.fn().mockResolvedValue({ jobCount: 3, sent: 10 }),
  };
  const controller = new ArtinfoPushController(repository as unknown as ArtinfoPushRepository, pushService as unknown as ArtinfoPushService);
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
    await expect(controller.getPreferences(me)).resolves.toEqual({ job: true });
    repository.findPreferences.mockResolvedValue({ job: false });
    await expect(controller.getPreferences(me)).resolves.toEqual({ job: false });
  });

  it('updatePreferences — 보낸 항목만 바꾸고 저장한 뒤 전체를 돌려준다', async () => {
    repository.findPreferences.mockResolvedValue(null);
    await expect(controller.updatePreferences(me, { job: false })).resolves.toEqual({ job: false });
    expect(repository.savePreferences).toHaveBeenCalledWith(7, { job: false });

    repository.findPreferences.mockResolvedValue({ job: false });
    await expect(controller.updatePreferences(me, {})).resolves.toEqual({ job: false });
    expect(repository.savePreferences).toHaveBeenLastCalledWith(7, { job: false });
  });

  it('sendTest — 대상·제목·본문을 넘기고, 비어 있으면 기본 문구를 쓴다', async () => {
    await expect(controller.sendTest(me, { target: 'ADMIN' })).resolves.toEqual({ sent: 2 });
    expect(pushService.sendTest).toHaveBeenCalledWith('ADMIN', '아트인포 테스트 푸시', '푸시 테스트 메시지입니다.');

    await controller.sendTest(me, { target: 'ALL', title: ' 점검 안내 ', body: ' 오늘 밤 점검이 있어요 ' });
    expect(pushService.sendTest).toHaveBeenLastCalledWith('ALL', '점검 안내', '오늘 밤 점검이 있어요');
  });

  it('sendDigestNow — 요약 발송 결과(공고 수·기기 수)를 돌려준다', async () => {
    await expect(controller.sendDigestNow(me)).resolves.toEqual({ jobCount: 3, sent: 10 });
  });
});
