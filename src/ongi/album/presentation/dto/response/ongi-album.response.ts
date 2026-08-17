import { ApiProperty } from '@nestjs/swagger';
import { OngiAlbumView } from '@/ongi/album/domain/repository/ongi-album.repository.interface';

/** 커버가 없는 앨범에 보여줄 기본 이미지 */
const DEFAULT_COVER_URL = 'https://picsum.photos/seed/ongi-album/600/420?grayscale';

export class OngiAlbumResponse {
  @ApiProperty({ type: String, description: '앨범 id' })
  id: string;

  @ApiProperty({ type: String, description: '그룹 id' })
  groupId: string;

  @ApiProperty({ type: String, description: '앨범 이름' })
  title: string;

  @ApiProperty({ type: String, description: '커버 이미지 URL' })
  coverUrl: string;

  @ApiProperty({ type: Number, description: '담긴 사진 수' })
  photoCount: number;

  @ApiProperty({ type: String, description: '목록 부가 정보', example: '8월' })
  meta: string;

  constructor(view: OngiAlbumView) {
    this.id = String(view.album.id);
    this.groupId = String(view.album.groupId);
    this.title = view.album.title;
    this.coverUrl = view.album.coverUrl ?? view.latestPhotoUrl ?? DEFAULT_COVER_URL;
    this.photoCount = view.photoCount;
    this.meta = view.latestPhotoAt ? `${new Date(view.latestPhotoAt).getMonth() + 1}월` : '새 앨범';
  }
}

export class OngiAlbumListResponse {
  @ApiProperty({ type: [OngiAlbumResponse], description: '그룹의 앨범 목록' })
  albums: OngiAlbumResponse[];

  constructor(views: OngiAlbumView[]) {
    this.albums = views.map(view => new OngiAlbumResponse(view));
  }
}
