import { pickAlbumCoverUrl } from '@/ongi/album/domain/service/ongi-album-cover';

const photo = (url: string, thumbUrl: string | null = null) => ({ url, thumb_url: thumbUrl, media_type: 'photo' });
const video = (url: string, thumbUrl: string | null = null) => ({ url, thumb_url: thumbUrl, media_type: 'video' });

describe('pickAlbumCoverUrl — 앨범 커버는 "그릴 수 있는" 가장 최근 항목 (최신순으로 받는다)', () => {
  it('사진은 축소본을 우선 쓴다', () => {
    expect(pickAlbumCoverUrl([photo('a.jpg', 'a.thumb.webp')])).toBe('a.thumb.webp');
  });

  it('축소본이 없는 사진은 원본을 쓴다 — 구버전 사진', () => {
    expect(pickAlbumCoverUrl([photo('a.jpg')])).toBe('a.jpg');
  });

  it('최신이 영상이면 포스터(thumb_url)를 커버로 쓴다', () => {
    expect(pickAlbumCoverUrl([video('v.mp4', 'v.poster.webp'), photo('a.jpg', 'a.thumb.webp')])).toBe('v.poster.webp');
  });

  it('포스터가 없는 영상은 건너뛰고 다음 항목을 커버로 쓴다 — mp4 URL 은 이미지로 그릴 수 없다', () => {
    expect(pickAlbumCoverUrl([video('v.mp4'), photo('a.jpg', 'a.thumb.webp')])).toBe('a.thumb.webp');
  });

  it('포스터 없는 영상이 여러 개 이어져도 그 뒤의 사진까지 내려간다', () => {
    expect(pickAlbumCoverUrl([video('v2.mov'), video('v1.mp4'), photo('a.jpg')])).toBe('a.jpg');
  });

  it('그릴 수 있는 항목이 하나도 없으면 null — 기본 커버로 떨어진다', () => {
    expect(pickAlbumCoverUrl([video('v.mp4'), video('v2.mp4')])).toBeNull();
  });

  it('빈 앨범은 null', () => {
    expect(pickAlbumCoverUrl([])).toBeNull();
  });

  it('media_type 이 없는 구버전 행은 사진으로 본다', () => {
    expect(pickAlbumCoverUrl([{ url: 'a.jpg', thumb_url: null, media_type: null }])).toBe('a.jpg');
  });
});
