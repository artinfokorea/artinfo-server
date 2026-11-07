import { ArtinfoModerationController } from '@/moderation/artinfo-moderation.controller';
import { ArtinfoModerationRepository } from '@/moderation/artinfo-moderation.repository';
import { CannotBlockYourself } from '@/moderation/artinfo-moderation.exception';

describe('ArtinfoModerationController', () => {
  const repository = {
    report: jest.fn().mockResolvedValue(undefined),
    block: jest.fn().mockResolvedValue(undefined),
    unblock: jest.fn().mockResolvedValue(undefined),
    blockedUserIds: jest.fn().mockResolvedValue([9]),
  };
  const controller = new ArtinfoModerationController(repository as unknown as ArtinfoModerationRepository);
  const me = { id: 7, name: '나', email: 'me@example.com' };

  beforeEach(() => jest.clearAllMocks());

  it('신고 — 로그인한 회원 ID 를 신고자로 저장한다', async () => {
    await controller.report(me, { targetType: 'COMMENT', targetId: 5, reason: 'ABUSE' });
    expect(repository.report).toHaveBeenCalledWith({ reporterUserId: 7, targetType: 'COMMENT', targetId: 5, reason: 'ABUSE' });
  });

  it('차단 — 자기 자신은 차단할 수 없다', async () => {
    await expect(controller.block(me, { userId: 7 })).rejects.toBeInstanceOf(CannotBlockYourself);
    expect(repository.block).not.toHaveBeenCalled();
  });

  it('차단·해제·목록', async () => {
    await controller.block(me, { userId: 9 });
    expect(repository.block).toHaveBeenCalledWith(7, 9);
    await controller.unblock(me, 9);
    expect(repository.unblock).toHaveBeenCalledWith(7, 9);
    await expect(controller.blockedUsers(me)).resolves.toEqual({ userIds: [9] });
  });
});
