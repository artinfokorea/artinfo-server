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
  OnchurchPaidChurchMonth,
  OnchurchSignupFunnel,
} from '@/onchurch/master/domain/repository/onchurch-dashboard.repository.interface';

export type OnchurchDashboardResult = {
  month: string;
  overall: {
    paidChurchTotal: number; // 전체 결제 교회 수(월 무관)
    totalIncome: number; // 전체 수입(월 무관)
    totalExpense: number; // 전체 지출(월 무관)
  };
  ledger: OnchurchLedgerSummary;
  funnel: OnchurchSignupFunnel;
  paidChurchInflow: OnchurchPaidChurchInflowDay[];
  monthlyPaidChurches: OnchurchPaidChurchMonth[]; // 최근 12개월 월별 결제 교회 수(0 포함)
};

// 현재 KST 기준 최근 12개월 라벨(YYYY-MM)을 오래된 순으로 반환.
function lastTwelveKstMonths(): string[] {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit' }).formatToParts(
    new Date(),
  );
  const year = Number(parts.find((p) => p.type === 'year')?.value);
  const month = Number(parts.find((p) => p.type === 'month')?.value); // 1-12

  const labels: string[] = [];
  for (let i = 11; i >= 0; i--) {
    let mm = month - i;
    let yy = year;
    while (mm <= 0) {
      mm += 12;
      yy -= 1;
    }
    labels.push(`${yy}-${String(mm).padStart(2, '0')}`);
  }
  return labels;
}

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

    const [ledger, funnel, paidChurchInflow, overallLedger, paidChurchTotal, paidChurchByMonth] = await Promise.all([
      this.ledgerRepository.summary({ month: params.month }),
      this.dashboardRepository.signupFunnel({ month: params.month }),
      this.dashboardRepository.paidChurchInflowByDay({ month: params.month }),
      this.ledgerRepository.summary({ month: null }),
      this.dashboardRepository.paidChurchTotal(),
      this.dashboardRepository.paidChurchCountByMonth(),
    ]);

    const overall = {
      paidChurchTotal,
      totalIncome: overallLedger.totalIncome,
      totalExpense: overallLedger.totalExpense,
    };

    // 최근 12개월 라벨에 맞춰 0으로 채운다.
    const countByMonth = new Map(paidChurchByMonth.map((r) => [r.month, r.count]));
    const monthlyPaidChurches = lastTwelveKstMonths().map((month) => ({ month, count: countByMonth.get(month) ?? 0 }));

    return { month: params.month, overall, ledger, funnel, paidChurchInflow, monthlyPaidChurches };
  }
}
