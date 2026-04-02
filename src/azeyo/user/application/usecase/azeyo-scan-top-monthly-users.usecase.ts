import { Inject, Injectable } from '@nestjs/common';
import { AZEYO_USER_REPOSITORY, IAzeyoUserRepository } from '@/azeyo/user/domain/repository/azeyo-user.repository.interface';
import { AzeyoUser } from '@/azeyo/user/domain/entity/azeyo-user.entity';

@Injectable()
export class AzeyoScanTopMonthlyUsersUseCase {
  constructor(
    @Inject(AZEYO_USER_REPOSITORY) private readonly userRepository: IAzeyoUserRepository,
  ) {}

  async execute(count: number): Promise<AzeyoUser[]> {
    return this.userRepository.findTopMonthlyUsers(count);
  }
}
