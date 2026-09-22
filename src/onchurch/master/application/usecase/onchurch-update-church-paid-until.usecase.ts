import { ForbiddenException, Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import {
  IOnchurchUserRepository,
  ONCHURCH_USER_REPOSITORY,
} from '@/onchurch/user/domain/repository/onchurch-user.repository.interface';
import { ONCHURCH_USER_ROLE, OnchurchUser } from '@/onchurch/user/domain/entity/onchurch-user.entity';
import {
  IOnchurchChurchOverviewRepository,
  ONCHURCH_CHURCH_OVERVIEW_REPOSITORY,
} from '@/onchurch/master/domain/repository/onchurch-church-overview.repository.interface';
import {
  IOnchurchLedgerRepository,
  ONCHURCH_LEDGER_REPOSITORY,
} from '@/onchurch/master/domain/repository/onchurch-ledger.repository.interface';

// 구독료: 1달 1만원, 1년(12달) 10만원. 개월이 온전히 차지 않는 잔여일은 금액으로 치지 않는다.
const MONTHLY_PRICE = 10_000;
const YEARLY_PRICE = 100_000;
// 가계부 자동 기록의 항목명.
const SUBSCRIPTION_CATEGORY = '구독료';

const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

type YmdParts = { y: number; m: number; d: number };

// 시각을 한국시간(KST) 기준 연·월·일로 끊는다. 결제 만료일은 KST 23:59:59로 저장되므로 날짜만 본다.
function kstParts(date: Date): YmdParts {
  const kst = new Date(date.getTime() + KST_OFFSET_MS);
  return { y: kst.getUTCFullYear(), m: kst.getUTCMonth() + 1, d: kst.getUTCDate() };
}

function kstYmd(date: Date): string {
  const { y, m, d } = kstParts(date);
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

// 그 달의 마지막 날인지. 1/31 → 2/28 처럼 달 길이 때문에 일자가 밀린 경우를 한 달로 봐주기 위해 쓴다.
function isLastDayOfMonth({ y, m, d }: YmdParts): boolean {
  return d === new Date(Date.UTC(y, m, 0)).getUTCDate();
}

// base → target 으로 온전히 채운 개월 수. 같은 일자로 한 달 뒤면 1, 1년 뒤면 12.
// (예: 9/14 → 10/14 = 1개월, 2026-09-14 → 2027-09-14 = 12개월, 9/14 → 10/13 = 0개월)
function wholeMonthsBetween(base: Date, target: Date): number {
  const b = kstParts(base);
  const t = kstParts(target);
  let months = (t.y - b.y) * 12 + (t.m - b.m);
  if (t.d < b.d && !isLastDayOfMonth(t)) months -= 1;
  return months;
}

// 개월 수 → 금액. 12개월 단위는 10만원, 나머지 개월은 1만원씩.
function priceForMonths(months: number): number {
  if (months <= 0) return 0;
  return Math.floor(months / 12) * YEARLY_PRICE + (months % 12) * MONTHLY_PRICE;
}

// 연장 전 이미 확보돼 있던 이용 종료일 = 기존 결제 만료일과 무료체험 종료일 중 늦은 쪽.
// 둘 다 없으면 오늘부터 연장한 것으로 본다.
function coverageEnd(owner: OnchurchUser, now: Date): Date {
  const candidates = [owner.paidUntil, owner.freeTrialUntil].filter((d): d is Date => !!d);
  if (candidates.length === 0) return now;
  return candidates.reduce((latest, d) => (d.getTime() > latest.getTime() ? d : latest));
}

@Injectable()
export class OnchurchUpdateChurchPaidUntilUseCase {
  private readonly logger = new Logger(OnchurchUpdateChurchPaidUntilUseCase.name);

  constructor(
    @Inject(ONCHURCH_USER_REPOSITORY)
    private readonly userRepository: IOnchurchUserRepository,
    @Inject(ONCHURCH_CHURCH_OVERVIEW_REPOSITORY)
    private readonly churchOverviewRepository: IOnchurchChurchOverviewRepository,
    @Inject(ONCHURCH_LEDGER_REPOSITORY)
    private readonly ledgerRepository: IOnchurchLedgerRepository,
  ) {}

  // 교회 소유자(owner)의 결제 만료일(paid_until)을 절대값으로 설정한다. null이면 해제.
  // 기간이 늘어난 경우에는 늘어난 개월 수만큼 재무관리(가계부)에 수입을 자동 기록한다.
  async execute(userId: number, churchId: number, paidUntil: Date | null): Promise<{ paidUntil: Date | null }> {
    const requester = await this.userRepository.findOneOrThrowById(userId);
    if (requester.role !== ONCHURCH_USER_ROLE.MASTER) {
      throw new ForbiddenException('마스터 권한이 필요합니다.');
    }

    const ownerId = await this.churchOverviewRepository.findOwnerIdByChurchId(churchId);
    if (!ownerId) throw new NotFoundException('교회를 찾을 수 없습니다.');

    const owner = await this.userRepository.findOneOrThrowById(ownerId);
    const previousCoverageEnd = coverageEnd(owner, new Date());
    const wasTest = owner.isTest;

    owner.paidUntil = paidUntil;
    await this.userRepository.saveEntity(owner);

    if (paidUntil && !wasTest) {
      await this.recordSubscriptionIncome({
        masterUserId: userId,
        churchId,
        from: previousCoverageEnd,
        to: paidUntil,
      });
    }

    return { paidUntil: owner.paidUntil };
  }

  // 연장분을 구독 수입으로 가계부에 남긴다. 기록 실패가 만료일 변경을 되돌리지는 않는다.
  private async recordSubscriptionIncome(params: {
    masterUserId: number;
    churchId: number;
    from: Date;
    to: Date;
  }): Promise<void> {
    const months = wholeMonthsBetween(params.from, params.to);
    const amount = priceForMonths(months);
    if (amount <= 0) return;

    try {
      const churchName = (await this.churchOverviewRepository.findNameById(params.churchId)) ?? `교회 #${params.churchId}`;
      await this.ledgerRepository.create({
        entryDate: kstYmd(new Date()),
        type: 'income',
        amount,
        category: SUBSCRIPTION_CATEGORY,
        memo: `${churchName} ${months}개월 (${kstYmd(params.from)} ~ ${kstYmd(params.to)})`,
        createdBy: params.masterUserId,
      });
    } catch (err) {
      this.logger.error(`구독 수입 가계부 기록 실패: churchId=${params.churchId}`, err as any);
    }
  }
}
