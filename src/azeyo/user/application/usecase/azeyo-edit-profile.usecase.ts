import { Inject, Injectable } from '@nestjs/common';
import { AZEYO_USER_REPOSITORY, IAzeyoUserRepository } from '@/azeyo/user/domain/repository/azeyo-user.repository.interface';

@Injectable()
export class AzeyoEditProfileUseCase {
  constructor(
    @Inject(AZEYO_USER_REPOSITORY) private readonly userRepository: IAzeyoUserRepository,
  ) {}

  async execute(userId: number, nickname: string, subtitle: string | null): Promise<void> {
    const user = await this.userRepository.findOneOrThrowById(userId);
    user.nickname = nickname;
    user.subtitle = subtitle;
    await this.userRepository.saveEntity(user);
  }
}
