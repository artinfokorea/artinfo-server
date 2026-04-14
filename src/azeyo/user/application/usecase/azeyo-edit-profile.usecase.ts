import { Inject, Injectable } from '@nestjs/common';
import { AZEYO_USER_REPOSITORY, IAzeyoUserRepository } from '@/azeyo/user/domain/repository/azeyo-user.repository.interface';

@Injectable()
export class AzeyoEditProfileUseCase {
  constructor(
    @Inject(AZEYO_USER_REPOSITORY) private readonly userRepository: IAzeyoUserRepository,
  ) {}

  async execute(userId: number, params: {
    name?: string | null;
    nickname: string;
    subtitle: string | null;
    email?: string | null;
    phone?: string | null;
  }): Promise<void> {
    const user = await this.userRepository.findOneOrThrowById(userId);
    if (params.name !== undefined) user.name = params.name;
    user.nickname = params.nickname;
    user.subtitle = params.subtitle;
    if (params.email !== undefined) user.email = params.email;
    if (params.phone !== undefined) user.phone = params.phone;
    await this.userRepository.saveEntity(user);
  }
}
