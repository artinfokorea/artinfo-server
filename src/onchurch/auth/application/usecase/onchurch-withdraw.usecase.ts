import { Inject, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { ONCHURCH_USER_REPOSITORY, IOnchurchUserRepository } from '@/onchurch/user/domain/repository/onchurch-user.repository.interface';
import { ONCHURCH_CHURCH_REPOSITORY, IOnchurchChurchRepository } from '@/onchurch/church/domain/repository/onchurch-church.repository.interface';
import { ONCHURCH_USER_ROLE } from '@/onchurch/user/domain/entity/onchurch-user.entity';
import { OnchurchWithdrawNotAllowed } from '@/onchurch/auth/domain/exception/onchurch-auth.exception';
import { OnchurchUserPasswordMismatch } from '@/onchurch/user/domain/exception/onchurch-user.exception';

// 회원 탈퇴 — 비밀번호를 다시 확인한 뒤 계정과 개인정보를 파기한다.
// 교회를 운영 중인 계정(소유자)은 교회가 주인 없이 남으므로 여기서 탈퇴시키지 않는다(문의 후 이관·삭제).
@Injectable()
export class OnchurchWithdrawUseCase {
  constructor(
    @Inject(ONCHURCH_USER_REPOSITORY)
    private readonly userRepository: IOnchurchUserRepository,

    @Inject(ONCHURCH_CHURCH_REPOSITORY)
    private readonly churchRepository: IOnchurchChurchRepository,
  ) {}

  async execute(userId: number, password: string): Promise<void> {
    const user = await this.userRepository.findOneOrThrowById(userId);

    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) throw new OnchurchUserPasswordMismatch();

    if (user.role === ONCHURCH_USER_ROLE.MASTER) throw new OnchurchWithdrawNotAllowed();
    const ownedChurch = await this.churchRepository.findByOwnerId(user.id);
    if (ownedChurch) throw new OnchurchWithdrawNotAllowed();

    await this.userRepository.withdraw(user.id);
  }
}
