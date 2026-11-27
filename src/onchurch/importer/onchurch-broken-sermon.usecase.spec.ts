import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { OnchurchBrokenSermonUseCase } from '@/onchurch/importer/onchurch-broken-sermon.usecase';

/**
 * 마스터 도구: 교회 설교 중 영상이 안 나오는 것(링크 없음 · 유튜브에서 삭제/비공개)을 찾아 지운다.
 * 교회 30 설교: 1 정상, 2 링크 없음, 3 유튜브 삭제(404), 4 비공개(401), 5 유튜브가 아닌 주소(확인 불가 → 그대로 둠)
 * 기대:
 * - 마스터가 아니면 403, 교회가 없으면 404
 * - 한 번에 limit 개씩 확인하고 다음 offset 을 준다(마지막이면 null)
 * - 링크 없음은 no-link, 유튜브 404/401/403 은 unavailable 로 알려준다
 * - 확인 중 네트워크 오류는 지우지 않는다(정상으로 본다)
 * - 삭제는 그 교회 설교 id 만 지운다
 */
function build(role = 'master', church = true) {
  const sermons = [
    { id: 1, title: '정상', date: '2026-11-22', videoUrl: 'https://www.youtube.com/watch?v=aaaaaaaaaaa' },
    { id: 2, title: '링크 없음', date: '2021-12-14', videoUrl: null },
    { id: 3, title: '삭제됨', date: '2023-01-01', videoUrl: 'https://www.youtube.com/watch?v=bbbbbbbbbbb' },
    { id: 4, title: '비공개', date: '2023-02-01', videoUrl: 'https://youtu.be/ccccccccccc' },
    { id: 5, title: '비메오', date: '2023-03-01', videoUrl: 'https://vimeo.com/1' },
    { id: 6, title: '오류', date: '2023-04-01', videoUrl: 'https://www.youtube.com/watch?v=ddddddddddd' },
  ];
  const userRepository = { findOneOrThrowById: jest.fn().mockResolvedValue({ id: 1, role }) };
  const repository = {
    findChurch: jest.fn().mockResolvedValue(church ? { id: 30, ownerId: 300 } : null),
    listSermonVideos: jest.fn(async (_c: number, offset: number, limit: number) => ({ items: sermons.slice(offset, offset + limit), total: sermons.length })),
    softDeleteSermons: jest.fn(async (_c: number, ids: number[]) => ids.length),
  };
  const status: Record<string, number | Error> = { aaaaaaaaaaa: 200, bbbbbbbbbbb: 404, ccccccccccc: 401, ddddddddddd: new Error('timeout') };
  const youtube = {
    status: jest.fn(async (videoId: string) => {
      const s = status[videoId];
      if (s instanceof Error) throw s;
      return s;
    }),
  };
  const useCase = new OnchurchBrokenSermonUseCase(userRepository as any, repository as any, youtube as any);
  return { useCase, repository, youtube };
}

describe('OnchurchBrokenSermonUseCase', () => {
  it('마스터가 아니면 403, 교회가 없으면 404', async () => {
    await expect(build('owner').useCase.find(1, 30, 0, 50)).rejects.toThrow(ForbiddenException);
    await expect(build('master', false).useCase.find(1, 30, 0, 50)).rejects.toThrow(NotFoundException);
  });

  it('영상이 안 나오는 설교만 이유와 함께 알려준다', async () => {
    const { useCase } = build();
    expect(await useCase.find(1, 30, 0, 50)).toEqual({
      broken: [
        { id: 2, title: '링크 없음', date: '2021-12-14', videoUrl: null, reason: 'no-link' },
        { id: 3, title: '삭제됨', date: '2023-01-01', videoUrl: 'https://www.youtube.com/watch?v=bbbbbbbbbbb', reason: 'unavailable' },
        { id: 4, title: '비공개', date: '2023-02-01', videoUrl: 'https://youtu.be/ccccccccccc', reason: 'unavailable' },
      ],
      checked: 6,
      total: 6,
      nextOffset: null,
    });
  });

  it('한 번에 limit 개씩 확인하고 다음 offset 을 준다', async () => {
    const { useCase } = build();
    const first = await useCase.find(1, 30, 0, 4);
    expect(first.nextOffset).toBe(4);
    expect(first.broken.map(b => b.id)).toEqual([2, 3, 4]);
    const second = await useCase.find(1, 30, 4, 4);
    expect(second).toMatchObject({ broken: [], checked: 2, nextOffset: null });
  });

  it('삭제는 그 교회 설교 id 만 지우고 지운 수를 돌려준다', async () => {
    const { useCase, repository } = build();
    expect(await useCase.remove(1, 30, [2, 3, 3])).toEqual({ deleted: 2 });
    expect(repository.softDeleteSermons).toHaveBeenCalledWith(30, [2, 3]);
    await expect(build('owner').useCase.remove(1, 30, [2])).rejects.toThrow(ForbiddenException);
  });
});
