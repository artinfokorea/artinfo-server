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

/** 그룹의 사진 장수 — 앨범 탭의 "전체 사진"·"미분류" 모음에 표시 */
export interface OngiGroupPhotoCounts {
  total: number;
  unfiled: number;
}

/** 앨범 목록 화면 한 번에 필요한 것 — 앨범들 + 전체·미분류 장수 */
export interface OngiAlbumListView {
  albums: OngiAlbumView[];
  totalCount: number;
  unfiledCount: number;
}

export interface IOngiAlbumRepository {
  create(creator: OngiAlbumCreator): Promise<OngiAlbum>;
  findById(id: number): Promise<OngiAlbum | null>;
  /** excludedAuthorMemberIds: 조회자가 차단한 구성원 — 그들의 사진은 커버·장수에서 제외 */
  scanViewsByGroupId(groupId: number, excludedAuthorMemberIds?: number[]): Promise<OngiAlbumView[]>;
  getViewById(id: number, excludedAuthorMemberIds?: number[]): Promise<OngiAlbumView | null>;
  /** 그룹 전체·미분류(album_id NULL) 장수 — 앨범 장수와 같은 기준(삭제·차단 구성원 제외) */
  countPhotosByGroupId(groupId: number, excludedAuthorMemberIds?: number[]): Promise<OngiGroupPhotoCounts>;
  rename(id: number, title: string): Promise<void>;
  /** 앨범 소프트 삭제 — 담긴 사진은 지우지 않고 미분류(album_id NULL)로 되돌린다 */
  softDeleteAndDetachPhotos(id: number): Promise<void>;
}
