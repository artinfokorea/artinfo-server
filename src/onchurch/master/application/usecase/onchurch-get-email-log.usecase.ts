import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
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

// 발송 진행 상황 폴링용 — 단건 로그 조회(상태·카운터·수신자별 결과 포함).
@Injectable()
export class OnchurchGetEmailLogUseCase {
  constructor(
    @Inject(ONCHURCH_USER_REPOSITORY)
    private readonly userRepository: IOnchurchUserRepository,
    @Inject(ONCHURCH_EMAIL_LOG_REPOSITORY)
    private readonly emailLogRepository: IOnchurchEmailLogRepository,
  ) {}

  async execute(userId: number, id: number): Promise<OnchurchEmailLog> {
    const user = await this.userRepository.findOneOrThrowById(userId);
    if (user.role !== ONCHURCH_USER_ROLE.MASTER) {
      throw new ForbiddenException('마스터 권한이 필요합니다.');
    }

    const log = await this.emailLogRepository.findById(id);
    if (!log) {
      throw new NotFoundException('발송 내역을 찾을 수 없습니다.');
    }
    return log;
  }
}
