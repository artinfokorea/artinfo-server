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

  async scanViewsByGroupId(groupId: number): Promise<OngiAlbumView[]> {
    const albums = await this.albumRepository.find({ where: { groupId }, order: { id: 'ASC' } });

    return this.toViews(albums);
  }

  async getViewById(id: number): Promise<OngiAlbumView | null> {
    const album = await this.findById(id);
    if (!album) return null;

    const [view] = await this.toViews([album]);

    return view ?? null;
  }

  private async toViews(albums: OngiAlbum[]): Promise<OngiAlbumView[]> {
    if (albums.length === 0) return [];

    const albumIds = albums.map(album => album.id);

    const countRows: { album_id: number; count: string }[] = await this.albumRepository.manager.query(
      `SELECT album_id, COUNT(*) AS count FROM ongi_photos WHERE album_id = ANY($1) AND deleted_at IS NULL GROUP BY album_id`,
      [albumIds],
    );
    const latestRows: { album_id: number; url: string; created_at: Date }[] = await this.albumRepository.manager.query(
      `SELECT DISTINCT ON (album_id) album_id, url, created_at
         FROM ongi_photos
        WHERE album_id = ANY($1) AND deleted_at IS NULL
        ORDER BY album_id, created_at DESC, id DESC`,
      [albumIds],
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
