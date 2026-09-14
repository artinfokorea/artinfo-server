import { OngiPhotoResponse } from '@/ongi/photo/presentation/dto/response/ongi-photo.response';
import { OngiPhotoView } from '@/ongi/photo/domain/repository/ongi-photo.repository.interface';

const view = (): OngiPhotoView =>
  ({
    photo: {
      id: 1,
      groupId: 2,
      authorMemberId: 3,
      albumId: null,
      url: 'https://example.com/a.jpg',
      thumbUrl: null,
      aspectRatio: 1,
      caption: null,
      location: null,
      likeCount: 0,
      mediaType: 'photo',
      durationSeconds: null,
      createdAt: new Date('2026-09-14T00:00:00.000Z'),
    },
    commentCount: 0,
    likedByMe: false,
  }) as unknown as OngiPhotoView;

describe('OngiPhotoResponse — 인물 태그(ongi_people) 제거 후 호환', () => {
  it('personIds 는 항상 빈 배열이다 — 구버전 앱(iOS 1.0.6·Android 1.0.2)이 photo.personIds.map 을 호출하므로 필드를 빼면 사진 상세가 크래시', () => {
    expect(new OngiPhotoResponse(view()).personIds).toEqual([]);
  });
});
