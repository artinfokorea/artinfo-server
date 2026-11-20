import * as bcrypt from 'bcrypt';
import { OnchurchAppLoginUseCase } from '@/onchurch/auth/application/usecase/onchurch-app-login.usecase';
import { IOnchurchUserRepository } from '@/onchurch/user/domain/repository/onchurch-user.repository.interface';
import { IOnchurchAuthRepository } from '@/onchurch/auth/domain/repository/onchurch-auth.repository.interface';
import { IOnchurchChurchRepository } from '@/onchurch/church/domain/repository/onchurch-church.repository.interface';
import { OnchurchInvalidCredentials, OnchurchNoChurch } from '@/onchurch/auth/domain/exception/onchurch-auth.exception';

/**
 * 교회: 10 은석교회(slug eunseok, 소유자 1) · 20 새빛교회(slug saebit, 소유자 9)
 * 계정(비밀번호는 모두 pw12345678):
 *  - 1 pastor  : 은석교회 소유자(owner). church_id 는 비어 있다
 *  - 2 saint   : 새빛교회 성도(member, church_id 20)
 *  - 3 nochurch: 교회를 아직 만들지 않은 관리자(admin, church_id 없음)
 * 기대: 앱 로그인은 교회를 묻지 않고, 로그인한 계정의 교회를 토큰과 함께 돌려준다
 */
const HASH = bcrypt.hashSync('pw12345678', 4);
const USERS = [
  { id: 1, loginId: 'pastor', password: HASH, role: 'owner', churchId: null },
  { id: 2, loginId: 'saint', password: HASH, role: 'member', churchId: 20 },
  { id: 3, loginId: 'nochurch', password: HASH, role: 'admin', churchId: null },
];
const CHURCHES = [
  { id: 10, slug: 'eunseok', name: '은석교회', ownerId: 1 },
  { id: 20, slug: 'saebit', name: '새빛교회', ownerId: 9 },
];

function build() {
  const userRepository = {
    findByLoginId: async (loginId: string) => USERS.find(u => u.loginId === loginId) ?? null,
  } as unknown as IOnchurchUserRepository;
  const authRepository = {
    create: async (creator: { userId: number }) => ({ accessToken: `access-${creator.userId}`, refreshToken: `refresh-${creator.userId}` }),
  } as unknown as IOnchurchAuthRepository;
  const churchRepository = {
    findByOwnerId: async (ownerId: number) => CHURCHES.find(c => c.ownerId === ownerId) ?? null,
    findById: async (id: number) => CHURCHES.find(c => c.id === id) ?? null,
  } as unknown as IOnchurchChurchRepository;
  return new OnchurchAppLoginUseCase(userRepository, authRepository, churchRepository);
}

describe('OnchurchAppLoginUseCase', () => {
  it('성도는 자기가 가입한 교회로 로그인된다', async () => {
    const result = await build().execute({ userId: 'saint', password: 'pw12345678' });
    expect(result.church.slug).toBe('saebit');
    expect(result.church.name).toBe('새빛교회');
    expect(result.auth.accessToken).toBe('access-2');
  });

  it('교회 소유자는 자기가 만든 교회로 로그인된다', async () => {
    const result = await build().execute({ userId: 'pastor', password: 'pw12345678' });
    expect(result.church.slug).toBe('eunseok');
    expect(result.auth.accessToken).toBe('access-1');
  });

  it('비밀번호가 틀리면 로그인할 수 없다', async () => {
    await expect(build().execute({ userId: 'saint', password: 'wrong-password' })).rejects.toBeInstanceOf(OnchurchInvalidCredentials);
  });

  it('없는 아이디면 로그인할 수 없다', async () => {
    await expect(build().execute({ userId: 'ghost', password: 'pw12345678' })).rejects.toBeInstanceOf(OnchurchInvalidCredentials);
  });

  it('소속 교회가 없는 계정은 앱에 로그인할 수 없다', async () => {
    await expect(build().execute({ userId: 'nochurch', password: 'pw12345678' })).rejects.toBeInstanceOf(OnchurchNoChurch);
  });
});
