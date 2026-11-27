import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { IOnchurchUserRepository, ONCHURCH_USER_REPOSITORY } from '@/onchurch/user/domain/repository/onchurch-user.repository.interface';
import { ONCHURCH_USER_ROLE } from '@/onchurch/user/domain/entity/onchurch-user.entity';
import { OnchurchImportRepository } from '@/onchurch/importer/onchurch-import.repository';
import { WordpressSource } from '@/onchurch/importer/wordpress-source';
import { ImportImageCopier } from '@/onchurch/importer/import-image-copier';
import { decodeEntities, extractImageUrls, extractYoutubeUrl, htmlToText, sermonDateFromTitle } from '@/onchurch/importer/wordpress-content';

export type ImportTarget = 'sermon' | 'notice' | 'gallery' | 'community';

export interface WordpressPost {
  id: number;
  /** 사이트 현지 시각 'YYYY-MM-DDTHH:mm:ss' — 설교·사진 날짜에 쓴다 */
  date: string;
  /** UTC 시각 'YYYY-MM-DDTHH:mm:ss' — DB 시각(created_at 등)은 UTC 로 저장한다 */
  dateGmt: string;
  categories: number[];
  /** HTML 엔티티가 남아 있는 제목 */
  title: string;
  /** HTML 본문 */
  content: string;
}

export interface WordpressImportRequest {
  sourceUrl: string;
  mappings: { categoryId: number; name: string; target: ImportTarget }[];
  pastorName: string | null;
  authorName: string;
  page: number;
  perPage: number;
}

export interface WordpressImportResult {
  imported: number;
  skipped: number;
  failed: number;
  totalPages: number;
  nextPage: number | null;
  errors: string[];
}

/**
 * 마스터 전용: 워드프레스 교회 사이트의 글을 온교회 교회로 옮긴다.
 * 한 번 호출에 한 쪽(perPage 개)씩 오래된 글부터 처리하고, 화면이 nextPage 로 이어 부른다.
 * 옮긴 글은 가져오기 기록에 남겨 다시 실행해도 겹치지 않는다. 알림(푸시)은 보내지 않는다.
 */
@Injectable()
export class OnchurchWordpressImportUseCase {
  constructor(
    @Inject(ONCHURCH_USER_REPOSITORY) private readonly userRepository: IOnchurchUserRepository,
    private readonly repository: OnchurchImportRepository,
    private readonly source: WordpressSource,
    private readonly images: ImportImageCopier,
  ) {}

  async listCategories(userId: number, sourceUrl: string) {
    await this.assertMaster(userId);
    return this.source.listCategories(sourceUrl);
  }

  async importPage(userId: number, churchId: number, req: WordpressImportRequest): Promise<WordpressImportResult> {
    await this.assertMaster(userId);
    const church = await this.repository.findChurch(churchId);
    if (!church) throw new NotFoundException('교회를 찾을 수 없습니다.');

    const host = new URL(req.sourceUrl).host;
    const { posts, totalPages } = await this.source.listPosts(
      req.sourceUrl,
      req.mappings.map(m => m.categoryId),
      req.page,
      req.perPage,
    );

    const result: WordpressImportResult = { imported: 0, skipped: 0, failed: 0, totalPages, nextPage: req.page < totalPages ? req.page + 1 : null, errors: [] };
    for (const p of posts) {
      const mapping = req.mappings.find(m => p.categories.includes(m.categoryId));
      const key = `wp:${host}:${p.id}`;
      if (!mapping || (await this.repository.isImported(churchId, key))) {
        result.skipped += 1;
        continue;
      }
      const title = decodeEntities(p.title).trim() || '(제목 없음)';
      try {
        const targetId = await this.importOne(church, mapping, p, title, req);
        if (targetId === null) {
          result.skipped += 1;
          continue;
        }
        await this.repository.markImported(churchId, key, mapping.target, targetId);
        result.imported += 1;
      } catch (error) {
        result.failed += 1;
        result.errors.push(`${title}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
    return result;
  }

  /** 만든 글 id. 옮길 게 없으면(사진 없는 갤러리) null. */
  private async importOne(
    church: { id: number; ownerId: number },
    mapping: WordpressImportRequest['mappings'][number],
    p: WordpressPost,
    title: string,
    req: WordpressImportRequest,
  ): Promise<number | null> {
    const text = htmlToText(p.content);
    switch (mapping.target) {
      case 'sermon': {
        const seriesId = await this.repository.findOrCreateSermonSeries(church.id, mapping.name);
        return this.repository.insertSermon({
          churchId: church.id,
          seriesId,
          title,
          pastor: req.pastorName?.trim() || null,
          date: sermonDateFromTitle(title, p.date),
          videoUrl: extractYoutubeUrl(p.content),
          summary: text || null,
          createdAt: p.dateGmt,
        });
      }
      case 'notice': {
        await this.repository.ensureNoticeCategory(church.id, mapping.name);
        return this.repository.insertNotice({
          churchId: church.id,
          category: mapping.name,
          title,
          content: text || null,
          imageUrls: await this.copyImages(p.content, church.id),
          publishedAt: p.dateGmt,
        });
      }
      case 'gallery': {
        const photos = await this.copyImages(p.content, church.id);
        if (photos.length === 0) return null;
        const categoryId = await this.repository.findOrCreateGalleryCategory(church.id, mapping.name);
        const batchId = `wp-${randomBytes(8).toString('hex')}`;
        const ids = await this.repository.insertGalleryItems(
          photos.map((photoUrl, i) => ({
            churchId: church.id,
            categoryId,
            batchId,
            title,
            date: p.date.slice(0, 10),
            photoUrl,
            sortOrder: i,
            createdAt: p.dateGmt,
          })),
        );
        return ids[0];
      }
      case 'community': {
        await this.repository.ensureCommunityCategory(church.id, mapping.name);
        return this.repository.insertCommunityPost({
          churchId: church.id,
          authorId: church.ownerId,
          authorName: req.authorName,
          category: mapping.name,
          title,
          content: text || null,
          photoUrls: await this.copyImages(p.content, church.id),
          videoUrl: extractYoutubeUrl(p.content),
          createdAt: p.dateGmt,
        });
      }
    }
  }

  private async copyImages(html: string, churchId: number): Promise<string[]> {
    const out: string[] = [];
    for (const url of extractImageUrls(html)) {
      const copied = await this.images.copy(url, churchId);
      if (copied) out.push(copied);
    }
    return out;
  }

  private async assertMaster(userId: number): Promise<void> {
    const user = await this.userRepository.findOneOrThrowById(userId);
    if (user.role !== ONCHURCH_USER_ROLE.MASTER) throw new ForbiddenException('마스터 권한이 필요합니다.');
  }
}
