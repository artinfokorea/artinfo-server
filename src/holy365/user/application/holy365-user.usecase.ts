import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Holy365UserRepository } from '@/holy365/user/infrastructure/holy365-user.repository';
import { HOLY365_EMAIL_TYPE, HOLY365_LOCALE, Holy365User } from '@/holy365/user/domain/entity/holy365-user.entity';
import { isValidPassword, normalizeDisplayName } from '@/holy365/auth/domain/service/holy365-credential-policy';
import { Holy365Errors } from '@/holy365/common/holy365.exception';

@Injectable()
export class Holy365UserUseCase {
  constructor(private readonly userRepository: Holy365UserRepository) {}

  me(userId: number): Promise<Holy365User> {
    return this.userRepository.findOneOrThrow(userId);
  }

  async update(userId: number, patch: { name?: string; locale?: string }): Promise<Holy365User> {
    const changes: { name?: string; locale?: string } = {};
    if (patch.name !== undefined) {
      const name = normalizeDisplayName(patch.name);
      if (!name) throw Holy365Errors.invalidName();
      changes.name = name;
    }
    if (patch.locale !== undefined) changes.locale = patch.locale === HOLY365_LOCALE.ZH ? HOLY365_LOCALE.ZH : HOLY365_LOCALE.KO;

    await this.userRepository.findOneOrThrow(userId);
    if (Object.keys(changes).length) await this.userRepository.update(userId, changes);

    return this.userRepository.findOneOrThrow(userId);
  }

  async changePassword(userId: number, currentPassword: string, newPassword: string): Promise<void> {
    const user = await this.userRepository.findOneOrThrow(userId);
    if (user.snsType !== HOLY365_EMAIL_TYPE) throw Holy365Errors.notEmailAccount();

    const hash = await this.userRepository.findPasswordHash(userId);
    if (!hash || !(await bcrypt.compare(currentPassword, hash))) throw Holy365Errors.invalidCredentials();
    if (!isValidPassword(newPassword)) throw Holy365Errors.weakPassword();

    await this.userRepository.update(userId, { passwordHash: await bcrypt.hash(newPassword, 10) });
  }

  async withdraw(userId: number): Promise<void> {
    await this.userRepository.findOneOrThrow(userId);
    await this.userRepository.withdraw(userId);
  }
}
