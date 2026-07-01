import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import {
  IOnchurchUserRepository,
  ONCHURCH_USER_REPOSITORY,
} from '@/onchurch/user/domain/repository/onchurch-user.repository.interface';
import { ONCHURCH_USER_ROLE } from '@/onchurch/user/domain/entity/onchurch-user.entity';
import {
  IOnchurchLedgerRepository,
  ONCHURCH_LEDGER_REPOSITORY,
  OnchurchLedgerSummary,
} from '@/onchurch/master/domain/repository/onchurch-ledger.repository.interface';
import {
  IOnchurchDashboardRepository,
  ONCHURCH_DASHBOARD_REPOSITORY,
  OnchurchPaidChurchInflowDay,
  OnchurchSignupFunnel,
} from '@/onchurch/master/domain/repository/onchurch-dashboard.repository.interface';

export type OnchurchDashboardResult = {
  month: string;
  ledger: OnchurchLedgerSummary;
  funnel: OnchurchSignupFunnel;
  paidChurchInflow: OnchurchPaidChurchInflowDay[];
};

@Injectable()
export class OnchurchGetDashboardUseCase {
  constructor(
    @Inject(ONCHURCH_USER_REPOSITORY) private readonly userRepository: IOnchurchUserRepository,
    @Inject(ONCHURCH_LEDGER_REPOSITORY) private readonly ledgerRepository: IOnchurchLedgerRepository,
    @Inject(ONCHURCH_DASHBOARD_REPOSITORY) private readonly dashboardRepository: IOnchurchDashboardRepository,
  ) {}

  async execute(userId: number, params: { month: string }): Promise<OnchurchDashboardResult> {
    const user = await this.userRepository.findOneOrThrowById(userId);
    if (user.role !== ONCHURCH_USER_ROLE.MASTER) {
      throw new ForbiddenException('마스터 권한이 필요합니다.');
    }

    const [ledger, funnel, paidChurchInflow] = await Promise.all([
      this.ledgerRepository.summary({ month: params.month }),
      this.dashboardRepository.signupFunnel({ month: params.month }),
      this.dashboardRepository.paidChurchInflowByDay({ month: params.month }),
    ]);

    return { month: params.month, ledger, funnel, paidChurchInflow };
  }
}
