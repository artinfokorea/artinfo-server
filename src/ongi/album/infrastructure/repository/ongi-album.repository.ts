import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IOngiAlbumRepository, OngiAlbumView } from '@/ongi/album/domain/repository/ongi-album.repository.interface';
import { OngiAlbum, OngiAlbumCreator } from '@/ongi/album/domain/entity/ongi-album.entity';
import { pickAlbumCoverUrl } from '@/ongi/album/domain/service/ongi-album-cover';

/** 앨범당 커버 후보로 읽어 오는 최신 항목 수 — 포스터 없는 영상이 연달아 있어도 커버를 찾을 만큼 */
const COVER_CANDIDATES = 10;

@Injectable()
export class OngiAlbumRepository implements IOngiAlbumRepository {
  constructor(
    @InjectRepository(OngiAlbum)
    private readonly albumRepository: Repository<OngiAlbum>,
  ) {}

  async create(creator: OngiAlbumCreator): Promise<OngiAlbum> {
    return this.albumRepository.save({
      groupId: creator.groupId,
      title: creator.title,
      coverUrl: creator.coverUrl,
    });
  }

  async findById(id: number): Promise<OngiAlbum | null> {
    return this.albumRepository.findOneBy({ id });
  }

  async rename(id: number, title: string): Promise<void> {
    await this.albumRepository.update({ id }, { title });
  }

  async softDeleteAndDetachPhotos(id: number): Promise<void> {
    await this.albumRepository.manager.transaction(async manager => {
      // 담긴 사진은 지우지 않고 미분류로 — ongi_photos.album_id 만 비운다
      await manager.query('UPDATE ongi_photos SET album_id = NULL WHERE album_id = $1', [id]);
      await manager.getRepository(OngiAlbum).softDelete({ id });
    });
  }

  async scanViewsByGroupId(groupId: number, excludedAuthorMemberIds: number[] = []): Promise<OngiAlbumView[]> {
    const albums = await this.albumRepository.find({ where: { groupId }, order: { id: 'ASC' } });

    return this.toViews(albums, excludedAuthorMemberIds);
  }

  async getViewById(id: number, excludedAuthorMemberIds: number[] = []): Promise<OngiAlbumView | null> {
    const album = await this.findById(id);
    if (!album) return null;

    const [view] = await this.toViews([album], excludedAuthorMemberIds);

    return view ?? null;
  }

  /** 차단한 구성원의 사진은 커버·장수에서 제외 — 피드·앨범 사진 목록의 차단 필터와 일관되게 */
  private async toViews(albums: OngiAlbum[], excludedAuthorMemberIds: number[] = []): Promise<OngiAlbumView[]> {
    if (albums.length === 0) return [];

    const albumIds = albums.map(album => album.id);

    const countRows: { album_id: number; count: string }[] = await this.albumRepository.manager.query(
      `SELECT album_id, COUNT(*) AS count FROM ongi_photos
        WHERE album_id = ANY($1) AND deleted_at IS NULL AND NOT (author_member_id = ANY($2))
        GROUP BY album_id`,
      [albumIds, excludedAuthorMemberIds],
    );
    // 커버 후보는 앨범당 최신 COVER_CANDIDATES 개 — 포스터 없는 영상이 최신이면 그 아래 항목까지 내려가야 한다
    const latestRows: { album_id: number; url: string; thumb_url: string | null; media_type: string | null; created_at: Date; rn: string }[] =
      await this.albumRepository.manager.query(
        `SELECT album_id, url, thumb_url, media_type, created_at, rn FROM (
           SELECT album_id, url, thumb_url, media_type, created_at,
                  ROW_NUMBER() OVER (PARTITION BY album_id ORDER BY created_at DESC, id DESC) AS rn
             FROM ongi_photos
            WHERE album_id = ANY($1) AND deleted_at IS NULL AND NOT (author_member_id = ANY($2))
         ) ranked
          WHERE rn <= $3
          ORDER BY album_id, rn`,
        [albumIds, excludedAuthorMemberIds, COVER_CANDIDATES],
      );

    const photoCounts = new Map(countRows.map(row => [Number(row.album_id), Number(row.count)]));
    const candidates = new Map<number, typeof latestRows>();
    for (const row of latestRows) {
      const albumId = Number(row.album_id);
      const list = candidates.get(albumId);
      if (list) list.push(row);
      else candidates.set(albumId, [row]);
    }

    return albums.map(album => {
      const rows = candidates.get(album.id) ?? [];
      const latest = rows[0];

      return {
        album,
        photoCount: photoCounts.get(album.id) ?? 0,
        // 커버는 그릴 수 있는 가장 최근 항목 — 포스터 없는 영상은 건너뛴다
        latestPhotoUrl: pickAlbumCoverUrl(rows),
        // '최근 추가' 표기는 실제 최신 항목 기준 (커버가 아래로 내려가도 시각은 그대로)
        latestPhotoAt: latest ? new Date(latest.created_at) : null,
      };
    });
  }
}
