import { PostService } from './PostService';

/**
 * 기대값: 글 삭제는 작성자 본인만 가능하되, 관리자(ADMIN)는 작성자와 상관없이 삭제할 수 있다.
 * - 일반 회원: 본인 글이 아니면 PostNotFound(findOneByIdAndUserIdOrThrow)
 * - 관리자: findOneByIdOrThrow 로 찾아 softRemove
 */
describe('PostService.removePost', () => {
  const userRepository = { findOneOrThrowById: jest.fn() };
  const postRepository = { findOneByIdAndUserIdOrThrow: jest.fn(), findOneByIdOrThrow: jest.fn(), softRemove: jest.fn().mockResolvedValue(undefined) };
  const service = new PostService(postRepository as any, userRepository as any, {} as any);

  beforeEach(() => jest.clearAllMocks());

  it('일반 회원은 본인 글만', async () => {
    userRepository.findOneOrThrowById.mockResolvedValue({ id: 7, type: 'CLIENT' });
    postRepository.findOneByIdAndUserIdOrThrow.mockResolvedValue({ id: 1, userId: 7 });
    await service.removePost(7, 1);
    expect(postRepository.findOneByIdAndUserIdOrThrow).toHaveBeenCalledWith(1, 7);
    expect(postRepository.findOneByIdOrThrow).not.toHaveBeenCalled();
    expect(postRepository.softRemove).toHaveBeenCalledWith({ id: 1, userId: 7 });
  });

  it('관리자는 누구의 글이든', async () => {
    userRepository.findOneOrThrowById.mockResolvedValue({ id: 1, type: 'ADMIN' });
    postRepository.findOneByIdOrThrow.mockResolvedValue({ id: 5, userId: 99 });
    await service.removePost(1, 5);
    expect(postRepository.findOneByIdOrThrow).toHaveBeenCalledWith(5);
    expect(postRepository.findOneByIdAndUserIdOrThrow).not.toHaveBeenCalled();
    expect(postRepository.softRemove).toHaveBeenCalledWith({ id: 5, userId: 99 });
  });
});
