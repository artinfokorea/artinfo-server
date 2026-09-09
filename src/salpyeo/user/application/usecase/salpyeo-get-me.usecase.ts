import { Inject, Injectable } from '@nestjs/common';
import { ISalpyeoUserRepository, SALPYEO_USER_REPOSITORY } from '@/salpyeo/user/domain/repository/salpyeo-user.repository.interface';
import { SalpyeoUser } from '@/salpyeo/user/domain/entity/salpyeo-user.entity';

@Injectable()
export class SalpyeoGetMeUseCase {
  constructor(
    @Inject(SALPYEO_USER_REPOSITORY)
    private readonly userRepository: ISalpyeoUserRepository,
  ) {}

  async execute(userId: number): Promise<SalpyeoUser> {
    return this.userRepository.findOneOrThrowById(userId);
  }
}
