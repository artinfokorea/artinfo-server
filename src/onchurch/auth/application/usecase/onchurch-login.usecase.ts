import { Inject, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { ONCHURCH_USER_REPOSITORY, IOnchurchUserRepository } from '@/onchurch/user/domain/repository/onchurch-user.repository.interface';
import { ONCHURCH_AUTH_REPOSITORY, IOnchurchAuthRepository } from '@/onchurch/auth/domain/repository/onchurch-auth.repository.interface';
import { ONCHURCH_CHURCH_REPOSITORY, IOnchurchChurchRepository } from '@/onchurch/church/domain/repository/onchurch-church.repository.interface';
import { OnchurchAuth } from '@/onchurch/auth/domain/entity/onchurch-auth.entity';
import { ONCHURCH_USER_ROLE } from '@/onchurch/user/domain/entity/onchurch-user.entity';
import { OnchurchLoginCommand } from '@/onchurch/auth/application/command/onchurch-login.command';
import { OnchurchInvalidCredentials, OnchurchNotAdmin, OnchurchNotChurchMember } from '@/onchurch/auth/domain/exception/onchurch-auth.exception';

@Injectable()
export class OnchurchLoginUseCase {
  constructor(
    @Inject(ONCHURCH_USER_REPOSITORY)
    private readonly userRepository: IOnchurchUserRepository,

    @Inject(ONCHURCH_AUTH_REPOSITORY)
    private readonly authRepository: IOnchurchAuthRepository,

    @Inject(ONCHURCH_CHURCH_REPOSITORY)
    private readonly churchRepository: IOnchurchChurchRepository,
  ) {}

  async execute(command: OnchurchLoginCommand): Promise<OnchurchAuth> {
    const user = await this.userRepository.findByLoginId(command.userId);
    if (!user) throw new OnchurchInvalidCredentials();

    const passwordMatches = await bcrypt.compare(command.password, user.password);
    if (!passwordMatches) throw new OnchurchInvalidCredentials();

    if (command.churchSlug) {
      // 교회 사이트에서 로그인하는 경우, 그 교회에 소속(성도)되었거나 소유(관리자)한 계정만 허용한다.
      const church = await this.churchRepository.findBySlug(command.churchSlug);
      const belongs = !!church && (user.churchId === church.id || church.ownerId === user.id);
      if (!belongs) throw new OnchurchNotChurchMember();
    } else {
      // 랜딩(관리 콘솔)에서 로그인하는 경우, 오너/관리자 계정만 허용한다.
      if (user.role !== ONCHURCH_USER_ROLE.OWNER && user.role !== ONCHURCH_USER_ROLE.ADMIN) throw new OnchurchNotAdmin();
    }

    return await this.authRepository.create({ userId: user.id }, user);
  }
}
