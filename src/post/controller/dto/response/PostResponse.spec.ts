import { PostResponse } from './PostResponse';
import { PostEntity } from '@/post/PostEntity';

/** 기대값: 작성자가 탈퇴해 user 가 비어 있어도 응답이 만들어지고 작성자는 '탈퇴회원', id 는 글의 userId 로 */
describe('PostResponse', () => {
  it('user 가 없으면 탈퇴회원으로 채운다', () => {
    const post = {
      id: 1,
      userId: 7,
      user: undefined,
      category: 'FREE',
      title: 't',
      contents: 'c',
      thumbnailImageUrl: null,
      viewCount: 3,
      likes: [],
      comments: [],
      isLiked: false,
      createdAt: new Date('2026-11-11'),
    } as unknown as PostEntity;
    const response = new PostResponse(post);
    expect(response.authorId).toBe(7);
    expect(response.authorName).toBe('탈퇴회원');
    expect(response.authorIconImageUrl).toBeNull();
    expect(response.likeCount).toBe(0);
  });
});
