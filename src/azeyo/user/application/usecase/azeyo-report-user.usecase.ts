import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { AZEYO_USER_REPOSITORY, IAzeyoUserRepository } from '@/azeyo/user/domain/repository/azeyo-user.repository.interface';
import { AZEYO_USER_REPORT_REPOSITORY, IAzeyoUserReportRepository } from '@/azeyo/user/domain/repository/azeyo-user-report.repository.interface';
import { AZEYO_USER_REPORT_REASON } from '@/azeyo/user/domain/entity/azeyo-user-report.entity';

@Injectable()
export class AzeyoReportUserUseCase {
  constructor(
    @Inject(AZEYO_USER_REPOSITORY) private readonly userRepository: IAzeyoUserRepository,
    @Inject(AZEYO_USER_REPORT_REPOSITORY) private readonly reportRepository: IAzeyoUserReportRepository,
  ) {}

  async execute(reporterId: number, targetId: number, reason: AZEYO_USER_REPORT_REASON, contents: string | null): Promise<void> {
    await this.userRepository.findOneOrThrowById(targetId);

    const existing = await this.reportRepository.findByTargetIdAndReporterId(targetId, reporterId);
    if (existing) {
      throw new HttpException({ code: 'AZEYO-USER-REPORT-001', message: '이미 신고한 유저입니다.' }, HttpStatus.CONFLICT);
    }

    await this.reportRepository.save({ reporterId, targetId, reason, contents });
  }
}
