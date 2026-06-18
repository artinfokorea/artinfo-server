import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import {
  IOnchurchUserRepository,
  ONCHURCH_USER_REPOSITORY,
} from '@/onchurch/user/domain/repository/onchurch-user.repository.interface';
import { ONCHURCH_USER_ROLE } from '@/onchurch/user/domain/entity/onchurch-user.entity';
import {
  IOnchurchSmsLogRepository,
  ONCHURCH_SMS_LOG_REPOSITORY,
} from '@/onchurch/master/domain/repository/onchurch-sms-log.repository.interface';
import { OnchurchSmsLog } from '@/onchurch/master/domain/entity/onchurch-sms-log.entity';
import { PagingItems } from '@/common/type/type';

@Injectable()
export class OnchurchListSmsLogsUseCase {
  constructor(
    @Inject(ONCHURCH_USER_REPOSITORY)
    private readonly userRepository: IOnchurchUserRepository,
    @Inject(ONCHURCH_SMS_LOG_REPOSITORY)
    private readonly smsLogRepository: IOnchurchSmsLogRepository,
  ) {}

  async execute(
    userId: number,
    params: { keyword: string | null; page: number; size: number },
  ): Promise<PagingItems<OnchurchSmsLog>> {
    const user = await this.userRepository.findOneOrThrowById(userId);
    if (user.role !== ONCHURCH_USER_ROLE.MASTER) {
      throw new ForbiddenException('마스터 권한이 필요합니다.');
    }

    return this.smsLogRepository.findPage(params);
  }
}
