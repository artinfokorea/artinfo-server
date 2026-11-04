import { ArtinfoActivityController } from '@/activity/artinfo-activity.controller';
import { ArtinfoActivityRepository } from '@/activity/repository/artinfo-activity.repository';
import { ArtinfoNewVisitorLimiter } from '@/activity/domain/artinfo-new-visitor-limiter';

describe('ArtinfoActivityController.ping — 첫 페이지와 마지막 페이지', () => {
  const addPing = jest.fn().mockResolvedValue(undefined);
  const allow = jest.fn().mockResolvedValue(true);
  const controller = new ArtinfoActivityController({ addPing } as unknown as ArtinfoActivityRepository, { allow } as unknown as ArtinfoNewVisitorLimiter);
  const visitorId = '3f2b8c1e-9a4d-4e6f-8b2a-1c3d5e7f9a0b';
  const ua = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Safari/604.1';

  beforeEach(() => {
    addPing.mockClear();
    allow.mockClear().mockResolvedValue(true);
  });

  it('currentPath 가 있으면 쿼리를 떼고 exitPath 로, path 는 landingPath 로 남긴다', async () => {
    await controller.ping(null, ua, undefined, { visitorId, path: '/', currentPath: '/jobs/3?tab=detail#top' });
    expect(addPing).toHaveBeenCalledWith(expect.objectContaining({ landingPath: '/', exitPath: '/jobs/3' }));
  });

  it('currentPath 가 없는 구버전 웹은 path 를 exitPath 로도 쓴다', async () => {
    await controller.ping(null, ua, undefined, { visitorId, path: '/lessons?page=2' });
    expect(addPing).toHaveBeenCalledWith(expect.objectContaining({ landingPath: '/lessons', exitPath: '/lessons' }));
  });

  it('paths 는 정리해서 넘기고, 없으면 빈 배열', async () => {
    await controller.ping(null, ua, undefined, { visitorId, paths: ['/', '/jobs?x=1', 'bad'] });
    expect(addPing).toHaveBeenCalledWith(expect.objectContaining({ paths: ['/', '/jobs'] }));
    await controller.ping(null, ua, undefined, { visitorId });
    expect(addPing).toHaveBeenLastCalledWith(expect.objectContaining({ paths: [] }));
  });

  it('경로가 / 로 시작하지 않으면 null', async () => {
    await controller.ping(null, ua, undefined, { visitorId, currentPath: 'https://evil.example/x' });
    expect(addPing).toHaveBeenCalledWith(expect.objectContaining({ exitPath: null }));
  });

  it('IP 당 새 방문자 상한을 넘으면 저장하지 않고 OK 만 돌려준다', async () => {
    allow.mockResolvedValue(false);
    await controller.ping(null, ua, '203.0.113.7, 10.0.0.2', { visitorId, newSession: true });
    expect(allow).toHaveBeenCalledWith('203.0.113.7', visitorId);
    expect(addPing).not.toHaveBeenCalled();
  });

  it('상한 안이면 저장한다 (방문자 ID 는 소문자로)', async () => {
    await controller.ping(null, ua, '203.0.113.7', { visitorId: visitorId.toUpperCase() });
    expect(allow).toHaveBeenCalledWith('203.0.113.7', visitorId);
    expect(addPing).toHaveBeenCalledWith(expect.objectContaining({ visitorId }));
  });

  it('로봇 UA 는 상한을 따지기도 전에 무시한다', async () => {
    await controller.ping(null, 'Mozilla/5.0 (compatible; Googlebot/2.1)', '203.0.113.7', { visitorId });
    expect(allow).not.toHaveBeenCalled();
    expect(addPing).not.toHaveBeenCalled();
  });
});
