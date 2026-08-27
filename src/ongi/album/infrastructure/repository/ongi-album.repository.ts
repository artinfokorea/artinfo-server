import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IOngiAlbumRepository, OngiAlbumView } from '@/ongi/album/domain/repository/ongi-album.repository.interface';
import { OngiAlbum, OngiAlbumCreator } from '@/ongi/album/domain/entity/ongi-album.entity';

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
    const latestRows: { album_id: number; url: string; created_at: Date }[] = await this.albumRepository.manager.query(
      `SELECT DISTINCT ON (album_id) album_id, url, created_at
         FROM ongi_photos
        WHERE album_id = ANY($1) AND deleted_at IS NULL AND NOT (author_member_id = ANY($2))
        ORDER BY album_id, created_at DESC, id DESC`,
      [albumIds, excludedAuthorMemberIds],
    );

    const photoCounts = new Map(countRows.map(row => [Number(row.album_id), Number(row.count)]));
    const latests = new Map(latestRows.map(row => [Number(row.album_id), row]));

    return albums.map(album => {
      const latest = latests.get(album.id);

      return {
        album,
        photoCount: photoCounts.get(album.id) ?? 0,
        latestPhotoUrl: latest?.url ?? null,
        latestPhotoAt: latest ? new Date(latest.created_at) : null,
      };
    });
  }
}
