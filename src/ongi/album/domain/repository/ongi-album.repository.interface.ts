import { OngiAlbum, OngiAlbumCreator } from '@/ongi/album/domain/entity/ongi-album.entity';

export const ONGI_ALBUM_REPOSITORY = Symbol('ONGI_ALBUM_REPOSITORY');

export interface OngiAlbumView {
  album: OngiAlbum;
  photoCount: number;
  /** 최신 사진 URL — 커버가 지정되지 않은 앨범의 커버로 사용 */
  latestPhotoUrl: string | null;
  /** 최신 사진 시각 — 목록의 부가 정보("8월") 계산용 */
  latestPhotoAt: Date | null;
}

export interface IOngiAlbumRepository {
  create(creator: OngiAlbumCreator): Promise<OngiAlbum>;
  findById(id: number): Promise<OngiAlbum | null>;
  scanViewsByGroupId(groupId: number): Promise<OngiAlbumView[]>;
  getViewById(id: number): Promise<OngiAlbumView | null>;
}
