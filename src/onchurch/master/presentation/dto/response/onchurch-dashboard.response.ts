import { ApiProperty } from '@nestjs/swagger';
import { OnchurchDashboardResult } from '@/onchurch/master/application/usecase/onchurch-dashboard.usecase';

class OnchurchDashboardLedgerResponse {
  @ApiProperty({ type: Number, description: '수입 합계(원)' }) totalIncome: number;
  @ApiProperty({ type: Number, description: '지출 합계(원)' }) totalExpense: number;

  constructor(income: number, expense: number) {
    this.totalIncome = income;
    this.totalExpense = expense;
  }
}

class OnchurchDashboardFunnelResponse {
  @ApiProperty({ type: Number, description: '랜딩 가입 수' }) signups: number;
  @ApiProperty({ type: Number, description: '교회 생성 수' }) createdChurch: number;
  @ApiProperty({ type: Number, description: '결제 수' }) paid: number;

  constructor(signups: number, createdChurch: number, paid: number) {
    this.signups = signups;
    this.createdChurch = createdChurch;
    this.paid = paid;
  }
}

class OnchurchDashboardInflowDayResponse {
  @ApiProperty({ type: String, description: '유입 날짜 (YYYY-MM-DD, KST)' }) date: string;
  @ApiProperty({ type: Number, description: '해당 날짜 결제 교회 유입 수' }) count: number;

  constructor(date: string, count: number) {
    this.date = date;
    this.count = count;
  }
}

export class OnchurchDashboardResponse {
  @ApiProperty({ type: String, description: '조회 월 (YYYY-MM)' }) month: string;
  @ApiProperty({ type: OnchurchDashboardLedgerResponse }) ledger: OnchurchDashboardLedgerResponse;
  @ApiProperty({ type: OnchurchDashboardFunnelResponse }) funnel: OnchurchDashboardFunnelResponse;
  @ApiProperty({ type: [OnchurchDashboardInflowDayResponse], description: '결제 교회 유입(일별)' })
  paidChurchInflow: OnchurchDashboardInflowDayResponse[];

  constructor(result: OnchurchDashboardResult) {
    this.month = result.month;
    this.ledger = new OnchurchDashboardLedgerResponse(result.ledger.totalIncome, result.ledger.totalExpense);
    this.funnel = new OnchurchDashboardFunnelResponse(
      result.funnel.signups,
      result.funnel.createdChurch,
      result.funnel.paid,
    );
    this.paidChurchInflow = result.paidChurchInflow.map((d) => new OnchurchDashboardInflowDayResponse(d.date, d.count));
  }
}
