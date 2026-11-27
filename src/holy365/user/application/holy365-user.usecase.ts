import { Injectable } from '@nestjs/common';
import { Holy365UserRepository } from '@/holy365/user/infrastructure/holy365-user.repository';
import { Holy365User } from '@/holy365/user/domain/entity/holy365-user.entity';
import { normalizeDisplayName } from '@/holy365/auth/domain/service/holy365-credential-policy';
import { localeOf } from '@/holy365/auth/application/holy365-auth.usecase';
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
    if (patch.locale !== undefined) changes.locale = localeOf(patch.locale);

    await this.userRepository.findOneOrThrow(userId);
    if (Object.keys(changes).length) await this.userRepository.update(userId, changes);

    return this.userRepository.findOneOrThrow(userId);
  }

  async withdraw(userId: number): Promise<void> {
    await this.userRepository.findOneOrThrow(userId);
    await this.userRepository.withdraw(userId);
  }
}
