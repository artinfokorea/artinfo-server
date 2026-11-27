import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IOnchurchUserRepository, ONCHURCH_USER_REPOSITORY } from '@/onchurch/user/domain/repository/onchurch-user.repository.interface';
import { ONCHURCH_USER_ROLE } from '@/onchurch/user/domain/entity/onchurch-user.entity';
import { OnchurchImportRepository } from '@/onchurch/importer/onchurch-import.repository';
import { YoutubeAvailability } from '@/onchurch/importer/youtube-availability';

export interface BrokenSermon {
  id: number;
  title: string;
  date: string | null;
  videoUrl: string | null;
  reason: 'no-link' | 'unavailable';
}

const YOUTUBE_ID = /(?:youtube(?:-nocookie)?\.com\/(?:embed\/|watch\?v=|shorts\/|live\/)|youtu\.be\/)([\w-]{11})/;
const UNAVAILABLE = new Set([401, 403, 404]);
const CONCURRENCY = 8;

/**
 * 마스터 도구: 교회 설교 중 영상이 안 나오는 것(링크 없음 · 유튜브에서 삭제/비공개)을 찾아 지운다.
 * 확인은 한 번에 limit 개씩(요청 시간이 길어지지 않게), 화면이 nextOffset 으로 이어 부른다.
 * 유튜브가 아닌 주소나 확인 중 오류는 지우지 않는다.
 */
@Injectable()
export class OnchurchBrokenSermonUseCase {
  constructor(
    @Inject(ONCHURCH_USER_REPOSITORY) private readonly userRepository: IOnchurchUserRepository,
    private readonly repository: OnchurchImportRepository,
    private readonly youtube: YoutubeAvailability,
  ) {}

  async find(
    userId: number,
    churchId: number,
    offset: number,
    limit: number,
  ): Promise<{ broken: BrokenSermon[]; checked: number; total: number; nextOffset: number | null }> {
    await this.assertMasterAndChurch(userId, churchId);
    const { items, total } = await this.repository.listSermonVideos(churchId, offset, limit);
    const results: (BrokenSermon | null)[] = new Array(items.length).fill(null);
    let cursor = 0;
    const worker = async () => {
      while (cursor < items.length) {
        const i = cursor++;
        const s = items[i];
        if (!s.videoUrl?.trim()) {
          results[i] = { ...s, reason: 'no-link' };
          continue;
        }
        const id = s.videoUrl.match(YOUTUBE_ID)?.[1];
        if (!id) continue;
        try {
          if (UNAVAILABLE.has(await this.youtube.status(id))) results[i] = { ...s, reason: 'unavailable' };
        } catch {
          // 확인 못 하면 지우지 않는다
        }
      }
    };
    await Promise.all(Array.from({ length: Math.min(CONCURRENCY, items.length) }, worker));
    const next = offset + items.length;
    return { broken: results.filter((r): r is BrokenSermon => r !== null), checked: items.length, total, nextOffset: next < total ? next : null };
  }

  async remove(userId: number, churchId: number, ids: number[]): Promise<{ deleted: number }> {
    await this.assertMasterAndChurch(userId, churchId);
    const unique = [...new Set(ids)];
    return { deleted: unique.length ? await this.repository.softDeleteSermons(churchId, unique) : 0 };
  }

  private async assertMasterAndChurch(userId: number, churchId: number): Promise<void> {
    const user = await this.userRepository.findOneOrThrowById(userId);
    if (user.role !== ONCHURCH_USER_ROLE.MASTER) throw new ForbiddenException('마스터 권한이 필요합니다.');
    if (!(await this.repository.findChurch(churchId))) throw new NotFoundException('교회를 찾을 수 없습니다.');
  }
}
