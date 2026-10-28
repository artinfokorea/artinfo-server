import { OngiCopyPhotosUseCase } from '@/ongi/photo/application/usecase/ongi-photo.usecase';
import { IOngiPhotoRepository } from '@/ongi/photo/domain/repository/ongi-photo.repository.interface';
import { IOngiMemberRepository } from '@/ongi/group/domain/repository/ongi-member.repository.interface';
import { IOngiAlbumRepository } from '@/ongi/album/domain/repository/ongi-album.repository.interface';
import { OngiPhoto, OngiPhotoCreator } from '@/ongi/photo/domain/entity/ongi-photo.entity';
import { OngiNotGroupMember } from '@/ongi/group/domain/exception/ongi-group.exception';
import { OngiAlbumNotInGroup } from '@/ongi/photo/domain/exception/ongi-photo.exception';

/**
 * 사용자: 1 엄마 · 2 할머니 · 9 모르는 사람
 * 공간: 10 우리 가족(엄마 admin, 할머니 member) · 20 외가(엄마·할머니 member) · 30 다른 집(모르는 사람 admin, 엄마는 승인 대기)
 * 사진: 100 엄마가 우리 가족에 올림 · 101 할머니가 우리 가족에 올림 · 300 다른 집 사진 · 200 외가 사진
 */
const MEMBERS = [
  { id: 101, userId: 1, groupId: 10, role: 'admin' },
  { id: 102, userId: 2, groupId: 10, role: 'member' },
  { id: 201, userId: 1, groupId: 20, role: 'member' },
  { id: 202, userId: 2, groupId: 20, role: 'member' },
  { id: 309, userId: 9, groupId: 30, role: 'admin' },
  { id: 301, userId: 1, groupId: 30, role: 'pending' },
];
const at = (iso: string) => new Date(iso);
const photo = (id: number, groupId: number, authorMemberId: number, createdAt: string) =>
  ({
    id,
    groupId,
    authorMemberId,
    albumId: null,
    url: `u${id}`,
    thumbUrl: `t${id}`,
    aspectRatio: 1,
    caption: null,
    location: null,
    mediaType: 'photo',
    durationSeconds: null,
    createdAt: at(createdAt),
  }) as OngiPhoto;
const PHOTOS = [
  photo(100, 10, 101, '2026-10-01T00:00:00Z'),
  photo(101, 10, 102, '2026-10-02T00:00:00Z'),
  photo(200, 20, 201, '2026-10-03T00:00:00Z'),
  photo(300, 30, 309, '2026-10-04T00:00:00Z'),
];
const ALBUMS = [
  { id: 2001, groupId: 20, title: '외가 앨범' },
  { id: 3001, groupId: 30, title: '남의 앨범' },
];

function build() {
  const created: OngiPhotoCreator[] = [];
  const photoRepository = {
    findById: async (id: number) => PHOTOS.find(p => p.id === id) ?? null,
    create: async (creator: OngiPhotoCreator) => {
      created.push(creator);
      return { ...creator, id: 1000 + created.length } as OngiPhoto;
    },
  } as unknown as IOngiPhotoRepository;
  const memberRepository = {
    findByGroupIdAndUserId: async (groupId: number, userId: number) => MEMBERS.find(m => m.groupId === groupId && m.userId === userId) ?? null,
  } as unknown as IOngiMemberRepository;
  const albumRepository = {
    findById: async (id: number) => ALBUMS.find(a => a.id === id) ?? null,
  } as unknown as IOngiAlbumRepository;
  return { useCase: new OngiCopyPhotosUseCase(photoRepository, memberRepository, albumRepository), created };
}

describe('OngiCopyPhotosUseCase — 다른 가족 공간에 사진 공유(복사)', () => {
  it('내 사진은 대상 공간에 복사되고 작성자는 공유한 나(대상 공간 구성원 id)가 된다', async () => {
    const { useCase, created } = build();
    const result = await useCase.execute(1, [100], 20, null);
    expect(result).toEqual({ copiedIds: [100], skippedIds: [] });
    expect(created).toHaveLength(1);
    expect(created[0]).toMatchObject({ groupId: 20, authorMemberId: 201, albumId: null, url: 'u100', thumbUrl: 't100' });
  });

  it('일반 구성원(할머니)도 같은 공간의 다른 사람(엄마) 사진을 복사할 수 있다 — 작성자·관리자 제한 없음', async () => {
    const { useCase, created } = build();
    const result = await useCase.execute(2, [100], 20, null);
    expect(result).toEqual({ copiedIds: [100], skippedIds: [] });
    expect(created[0]).toMatchObject({ groupId: 20, authorMemberId: 202, url: 'u100' });
  });

  it('내 사진과 남의 사진을 섞어 보내면 전부 복사되고 원본 게시 순서(오래된 것부터)로 만들어진다', async () => {
    const { useCase, created } = build();
    const result = await useCase.execute(1, [101, 100], 20, 2001);
    expect(result).toEqual({ copiedIds: [100, 101], skippedIds: [] });
    expect(created.map(c => c.url)).toEqual(['u100', 'u101']);
    expect(created.every(c => c.albumId === 2001)).toBe(true);
  });

  it('내가 구성원이 아닌(승인 대기만 있는) 공간의 사진은 건너뛴다', async () => {
    const { useCase, created } = build();
    const result = await useCase.execute(1, [300, 100], 20, null);
    expect(result).toEqual({ copiedIds: [100], skippedIds: [300] });
    expect(created).toHaveLength(1);
  });

  it('없는 사진과 이미 대상 공간에 있는 사진은 건너뛴다', async () => {
    const { useCase } = build();
    const result = await useCase.execute(1, [999, 200, 100], 20, null);
    expect(result).toEqual({ copiedIds: [100], skippedIds: [999, 200] });
  });

  it('대상 공간 구성원이 아니면 거부한다', async () => {
    const { useCase } = build();
    await expect(useCase.execute(9, [300], 20, null)).rejects.toBeInstanceOf(OngiNotGroupMember);
  });

  it('앨범이 대상 공간 소속이 아니면 거부한다', async () => {
    const { useCase } = build();
    await expect(useCase.execute(1, [100], 20, 3001)).rejects.toBeInstanceOf(OngiAlbumNotInGroup);
  });
});
