import * as bcrypt from 'bcrypt';
import { OnchurchWithdrawUseCase } from '@/onchurch/auth/application/usecase/onchurch-withdraw.usecase';
import { IOnchurchUserRepository } from '@/onchurch/user/domain/repository/onchurch-user.repository.interface';
import { IOnchurchChurchRepository } from '@/onchurch/church/domain/repository/onchurch-church.repository.interface';
import { OnchurchWithdrawNotAllowed } from '@/onchurch/auth/domain/exception/onchurch-auth.exception';
import { OnchurchUserPasswordMismatch } from '@/onchurch/user/domain/exception/onchurch-user.exception';

/**
 * 교회: 10 은석교회(소유자 1)
 * 계정(비밀번호는 모두 pw12345678):
 *  - 1 pastor: 은석교회 소유자
 *  - 2 saint : 은석교회 성도(member)
 *  - 3 master: 온교회 운영자(master)
 * 기대: 성도는 비밀번호를 확인한 뒤 탈퇴(개인정보 파기)되고, 교회를 운영 중인 계정과 운영자 계정은 탈퇴할 수 없다
 */
const HASH = bcrypt.hashSync('pw12345678', 4);
const USERS = [
  { id: 1, loginId: 'pastor', password: HASH, role: 'owner' },
  { id: 2, loginId: 'saint', password: HASH, role: 'member' },
  { id: 3, loginId: 'master', password: HASH, role: 'master' },
];

function build() {
  const withdrawn: number[] = [];
  const userRepository = {
    findOneOrThrowById: async (id: number) => USERS.find(u => u.id === id),
    withdraw: async (id: number) => {
      withdrawn.push(id);
    },
  } as unknown as IOnchurchUserRepository;
  const churchRepository = {
    findByOwnerId: async (ownerId: number) => (ownerId === 1 ? { id: 10, ownerId: 1 } : null),
  } as unknown as IOnchurchChurchRepository;
  return { useCase: new OnchurchWithdrawUseCase(userRepository, churchRepository), withdrawn };
}

describe('OnchurchWithdrawUseCase', () => {
  it('성도는 비밀번호를 확인하면 탈퇴된다', async () => {
    const { useCase, withdrawn } = build();
    await useCase.execute(2, 'pw12345678');
    expect(withdrawn).toEqual([2]);
  });

  it('비밀번호가 틀리면 탈퇴되지 않는다', async () => {
    const { useCase, withdrawn } = build();
    await expect(useCase.execute(2, 'wrong-password')).rejects.toBeInstanceOf(OnchurchUserPasswordMismatch);
    expect(withdrawn).toEqual([]);
  });

  it('교회를 운영 중인 계정은 탈퇴할 수 없다', async () => {
    const { useCase, withdrawn } = build();
    await expect(useCase.execute(1, 'pw12345678')).rejects.toBeInstanceOf(OnchurchWithdrawNotAllowed);
    expect(withdrawn).toEqual([]);
  });

  it('운영자 계정은 탈퇴할 수 없다', async () => {
    const { useCase, withdrawn } = build();
    await expect(useCase.execute(3, 'pw12345678')).rejects.toBeInstanceOf(OnchurchWithdrawNotAllowed);
    expect(withdrawn).toEqual([]);
  });
});
