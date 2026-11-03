import { ArtinfoActivityController } from '@/activity/artinfo-activity.controller';
import { ArtinfoActivityRepository } from '@/activity/repository/artinfo-activity.repository';

describe('ArtinfoActivityController.ping — 첫 페이지와 마지막 페이지', () => {
  const addPing = jest.fn().mockResolvedValue(undefined);
  const controller = new ArtinfoActivityController({ addPing } as unknown as ArtinfoActivityRepository);
  const visitorId = '3f2b8c1e-9a4d-4e6f-8b2a-1c3d5e7f9a0b';
  const ua = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Safari/604.1';

  beforeEach(() => addPing.mockClear());

  it('currentPath 가 있으면 쿼리를 떼고 exitPath 로, path 는 landingPath 로 남긴다', async () => {
    await controller.ping(null, ua, { visitorId, path: '/', currentPath: '/jobs/3?tab=detail#top' });
    expect(addPing).toHaveBeenCalledWith(expect.objectContaining({ landingPath: '/', exitPath: '/jobs/3' }));
  });

  it('currentPath 가 없는 구버전 웹은 path 를 exitPath 로도 쓴다', async () => {
    await controller.ping(null, ua, { visitorId, path: '/lessons?page=2' });
    expect(addPing).toHaveBeenCalledWith(expect.objectContaining({ landingPath: '/lessons', exitPath: '/lessons' }));
  });

  it('경로가 / 로 시작하지 않으면 null', async () => {
    await controller.ping(null, ua, { visitorId, currentPath: 'https://evil.example/x' });
    expect(addPing).toHaveBeenCalledWith(expect.objectContaining({ exitPath: null }));
  });
});
