import { OnchurchCommunityBlockService, OnchurchCommunityCannotBlockSelf } from '@/onchurch/community-block/onchurch-community-block.service';
import { OnchurchCommunityBlockRepository } from '@/onchurch/community-block/onchurch-community-block.repository';
import { IOnchurchUserRepository } from '@/onchurch/user/domain/repository/onchurch-user.repository.interface';
import { OnchurchUserNotFound } from '@/onchurch/user/domain/exception/onchurch-user.exception';

/**
 * 성도: 1 김성도 · 2 이성도 (99 는 없는 사용자)
 * 기대: 다른 성도를 차단·해제할 수 있고, 자기 자신이나 없는 사용자는 차단할 수 없다
 */
function build() {
  const blocks: Array<[number, number]> = [];
  const blockRepository = {
    add: async (userId: number, blockedUserId: number) => {
      if (!blocks.some(([a, b]) => a === userId && b === blockedUserId)) blocks.push([userId, blockedUserId]);
    },
    remove: async (userId: number, blockedUserId: number) => {
      const index = blocks.findIndex(([a, b]) => a === userId && b === blockedUserId);
      if (index >= 0) blocks.splice(index, 1);
    },
  } as unknown as OnchurchCommunityBlockRepository;
  const userRepository = {
    findOneOrThrowById: async (id: number) => {
      if (id !== 1 && id !== 2) throw new OnchurchUserNotFound();
      return { id };
    },
  } as unknown as IOnchurchUserRepository;
  return { service: new OnchurchCommunityBlockService(blockRepository, userRepository), blocks };
}

describe('OnchurchCommunityBlockService', () => {
  it('다른 성도를 차단한다 (같은 사람을 두 번 차단해도 한 번만 남는다)', async () => {
    const { service, blocks } = build();
    await service.block(1, 2);
    await service.block(1, 2);
    expect(blocks).toEqual([[1, 2]]);
  });

  it('차단을 해제한다', async () => {
    const { service, blocks } = build();
    await service.block(1, 2);
    await service.unblock(1, 2);
    expect(blocks).toEqual([]);
  });

  it('자기 자신은 차단할 수 없다', async () => {
    const { service, blocks } = build();
    await expect(service.block(1, 1)).rejects.toBeInstanceOf(OnchurchCommunityCannotBlockSelf);
    expect(blocks).toEqual([]);
  });

  it('없는 사용자는 차단할 수 없다', async () => {
    const { service, blocks } = build();
    await expect(service.block(1, 99)).rejects.toBeInstanceOf(OnchurchUserNotFound);
    expect(blocks).toEqual([]);
  });
});
