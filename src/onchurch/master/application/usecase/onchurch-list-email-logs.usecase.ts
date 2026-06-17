import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import {
  IOnchurchUserRepository,
  ONCHURCH_USER_REPOSITORY,
} from '@/onchurch/user/domain/repository/onchurch-user.repository.interface';
import { ONCHURCH_USER_ROLE } from '@/onchurch/user/domain/entity/onchurch-user.entity';
import {
  IOnchurchEmailLogRepository,
  ONCHURCH_EMAIL_LOG_REPOSITORY,
} from '@/onchurch/master/domain/repository/onchurch-email-log.repository.interface';
import { OnchurchEmailLog } from '@/onchurch/master/domain/entity/onchurch-email-log.entity';

@Injectable()
export class OnchurchListEmailLogsUseCase {
  constructor(
    @Inject(ONCHURCH_USER_REPOSITORY)
    private readonly userRepository: IOnchurchUserRepository,
    @Inject(ONCHURCH_EMAIL_LOG_REPOSITORY)
    private readonly emailLogRepository: IOnchurchEmailLogRepository,
  ) {}

  async execute(userId: number): Promise<OnchurchEmailLog[]> {
    const user = await this.userRepository.findOneOrThrowById(userId);
    if (user.role !== ONCHURCH_USER_ROLE.MASTER) {
      throw new ForbiddenException('마스터 권한이 필요합니다.');
    }

    return this.emailLogRepository.findAll();
  }
}
