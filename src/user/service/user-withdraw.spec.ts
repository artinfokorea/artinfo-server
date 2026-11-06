import { UserService } from '@/user/service/user.service';
import { UserRepository } from '@/user/repository/user.repository';
import { User } from '@/user/entity/user.entity';
import { Auth } from '@/auth/entity/auth.entity';
import { UserNotFound } from '@/user/exception/user.exception';

/**
 * 기대값: 회원탈퇴(DELETE /users/me)
 * - 개인정보(이름·닉네임·이메일·전화·생년월일·비밀번호·프로필 사진)를 익명화하고 soft delete 한다.
 *   이메일은 unique 라 `withdrawn-{id}-…@withdrawn.artinfokorea.com` 으로 바꿔 같은 이메일로 재가입할 수 있게 한다.
 * - 학력·로그인 토큰(auths)을 지우고 redis 의 refresh 캐시(USER:REFRESH={id})를 비운다.
 * - 없는 회원이면 UserNotFound.
 */
describe('UserService.withdraw', () => {
  const manager = {
    findOne: jest.fn(),
    update: jest.fn(),
    softDelete: jest.fn(),
    delete: jest.fn(),
  };
  const dataSource = { transaction: jest.fn(async (fn: (m: typeof manager) => Promise<void>) => fn(manager)) };
  const redis = { delete: jest.fn() };
  const schoolRepository = { deleteByUserId: jest.fn() };

  const makeService = () => new UserService(new UserRepository({} as any), schoolRepository as any, redis as any, dataSource as any, {} as any);

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Date, 'now').mockReturnValue(1_700_000_000_000);
  });

  it('개인정보를 익명화하고 soft delete 한 뒤 토큰·학력·캐시를 지운다', async () => {
    manager.findOne.mockResolvedValue({ id: 7, email: 'user@example.com' });

    await makeService().withdraw(7);

    expect(manager.update).toHaveBeenCalledWith(
      User,
      { id: 7 },
      {
        name: '탈퇴회원',
        nickname: '탈퇴회원',
        email: 'withdrawn-7-1700000000000@withdrawn.artinfokorea.com',
        phone: null,
        birth: null,
        password: null,
        iconImageUrl: null,
      },
    );
    expect(manager.softDelete).toHaveBeenCalledWith(User, { id: 7 });
    expect(schoolRepository.deleteByUserId).toHaveBeenCalledWith(7, manager);
    expect(manager.delete).toHaveBeenCalledWith(Auth, { userId: 7 });
    expect(redis.delete).toHaveBeenCalledWith('USER:REFRESH=7');
  });

  it('없는 회원이면 UserNotFound 를 던지고 아무것도 지우지 않는다', async () => {
    manager.findOne.mockResolvedValue(null);

    await expect(makeService().withdraw(99)).rejects.toBeInstanceOf(UserNotFound);
    expect(manager.update).not.toHaveBeenCalled();
    expect(manager.softDelete).not.toHaveBeenCalled();
    expect(redis.delete).not.toHaveBeenCalled();
  });
});
