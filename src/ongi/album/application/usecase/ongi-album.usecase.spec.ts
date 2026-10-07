import { OngiScanAlbumsUseCase } from '@/ongi/album/application/usecase/ongi-album.usecase';
import { IOngiAlbumRepository, OngiAlbumView } from '@/ongi/album/domain/repository/ongi-album.repository.interface';
import { IOngiMemberRepository } from '@/ongi/group/domain/repository/ongi-member.repository.interface';
import { IOngiBlockRepository } from '@/ongi/group/domain/repository/ongi-block.repository.interface';
import { OngiNotGroupMember } from '@/ongi/group/domain/exception/ongi-group.exception';
import { OngiAlbum } from '@/ongi/album/domain/entity/ongi-album.entity';

function albumView(id: number, photoCount: number): OngiAlbumView {
  return { album: { id, groupId: 7, title: `앨범 ${id}`, coverUrl: null } as OngiAlbum, photoCount, latestPhotoUrl: null, latestPhotoAt: null };
}

function setup(options: { member?: boolean; blockedUserIds?: number[]; blockedMemberIds?: number[] } = {}) {
  const calls: { scanViews?: unknown[]; countPhotos?: unknown[] } = {};
  const albumRepository = {
    scanViewsByGroupId: async (...args: unknown[]) => {
      calls.scanViews = args;
      return [albumView(1, 12), albumView(2, 30)];
    },
    countPhotosByGroupId: async (...args: unknown[]) => {
      calls.countPhotos = args;
      return { total: 57, unfiled: 15 };
    },
  } as unknown as IOngiAlbumRepository;
  const memberRepository = {
    findByGroupIdAndUserId: async () => (options.member === false ? null : { id: 100, groupId: 7, userId: 3 }),
    scanIdsByUserIds: async (userIds: number[]) => (userIds.length === 0 ? [] : (options.blockedMemberIds ?? [])),
  } as unknown as IOngiMemberRepository;
  const blockRepository = {
    blockedUserIdsOf: async () => options.blockedUserIds ?? [],
  } as unknown as IOngiBlockRepository;

  return { useCase: new OngiScanAlbumsUseCase(albumRepository, memberRepository, blockRepository), calls };
}

describe('OngiScanAlbumsUseCase — 앨범 목록 + 전체·미분류 장수', () => {
  it('앨범 목록과 함께 그룹 전체 장수·미분류 장수를 돌려준다', async () => {
    const { useCase, calls } = setup();

    const result = await useCase.execute(3, 7);

    expect(result.albums.map(view => view.photoCount)).toEqual([12, 30]);
    expect(result.totalCount).toBe(57);
    expect(result.unfiledCount).toBe(15);
    expect(calls.countPhotos).toEqual([7, []]);
  });

  it('차단한 구성원은 앨범 장수와 전체·미분류 장수 모두에서 같은 목록으로 제외한다', async () => {
    const { useCase, calls } = setup({ blockedUserIds: [9, 3], blockedMemberIds: [201] });

    await useCase.execute(3, 7);

    expect(calls.scanViews).toEqual([7, [201]]);
    expect(calls.countPhotos).toEqual([7, [201]]);
  });

  it('그룹 구성원이 아니면 거절한다', async () => {
    const { useCase } = setup({ member: false });

    await expect(useCase.execute(3, 7)).rejects.toBeInstanceOf(OngiNotGroupMember);
  });
});
