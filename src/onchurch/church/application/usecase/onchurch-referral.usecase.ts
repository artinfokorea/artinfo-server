import { Inject, Injectable } from '@nestjs/common';
import { randomInt } from 'crypto';
import { ONCHURCH_CHURCH_REPOSITORY, IOnchurchChurchRepository } from '@/onchurch/church/domain/repository/onchurch-church.repository.interface';
import { ONCHURCH_USER_REPOSITORY, IOnchurchUserRepository } from '@/onchurch/user/domain/repository/onchurch-user.repository.interface';
import { OnchurchChurch } from '@/onchurch/church/domain/entity/onchurch-church.entity';
import { OnchurchChurchManagerResolver } from '@/onchurch/church/application/service/onchurch-church-manager.resolver';
import {
  OnchurchChurchNotFound,
  OnchurchReferralAlreadyApplied,
  OnchurchReferralCodeNotFound,
  OnchurchReferralSelfNotAllowed,
  OnchurchReferralWindowClosed,
} from '@/onchurch/church/domain/exception/onchurch-church.exception';

// 추천 코드 문자셋 — 사람이 문자로 받아 적는 값이므로 혼동되는 글자(O/0, I/1)를 뺀다.
const CODE_CHARSET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const CODE_LENGTH = 6;
const CODE_MAX_TRY = 10;

export type OnchurchMyReferral = {
  code: string;
  // 이 교회를 추천인으로 입력한 교회 수.
  referredCount: number;
  // 이 교회가 입력한 추천인 교회 이름. 입력 전이면 null.
  referredByChurchName: string | null;
  // 추천인 코드를 입력할 수 있는 상태인지(미입력 + 첫 결제 확인 전).
  canApply: boolean;
};

@Injectable()
export class OnchurchGetMyReferralUseCase {
  constructor(
    @Inject(ONCHURCH_CHURCH_REPOSITORY)
    private readonly churchRepository: IOnchurchChurchRepository,

    @Inject(ONCHURCH_USER_REPOSITORY)
    private readonly userRepository: IOnchurchUserRepository,

    private readonly managerResolver: OnchurchChurchManagerResolver,
  ) {}

  // 내 교회의 추천 코드 + 추천 현황. 코드가 없으면 이 시점에 발급·저장한다
  // (가입 시점에 만들지 않는 이유: 이미 가입한 교회도 화면을 열면 코드를 갖게 하려고).
  async execute(userId: number): Promise<OnchurchMyReferral> {
    const church = await this.managerResolver.resolveManagedChurch(userId);
    if (!church) throw new OnchurchChurchNotFound();

    const code = church.referralCode?.trim() || (await this.issueCode(church.id));
    const referredCount = await this.churchRepository.countReferredByChurchId(church.id);
    const referrer = church.referredByChurchId ? await this.churchRepository.findById(church.referredByChurchId) : null;
    const owner = await this.userRepository.findOneOrThrowById(church.ownerId);

    return {
      code,
      referredCount,
      referredByChurchName: referrer?.name ?? null,
      canApply: !church.referredByChurchId && !owner.paidUntil,
    };
  }

  private async issueCode(churchId: number): Promise<string> {
    for (let i = 0; i < CODE_MAX_TRY; i += 1) {
      const candidate = this.randomCode();
      const taken = await this.churchRepository.findByReferralCode(candidate);
      if (taken) continue;
      const saved = await this.churchRepository.updateReferralCode(churchId, candidate);
      return saved.referralCode as string;
    }
    // 6자 32문자셋(약 10억 조합)에서 10회 연속 충돌은 사실상 불가능하다.
    throw new OnchurchReferralCodeNotFound();
  }

  private randomCode(): string {
    let code = '';
    for (let i = 0; i < CODE_LENGTH; i += 1) code += CODE_CHARSET[randomInt(CODE_CHARSET.length)];
    return code;
  }
}

@Injectable()
export class OnchurchApplyReferralCodeUseCase {
  constructor(
    @Inject(ONCHURCH_CHURCH_REPOSITORY)
    private readonly churchRepository: IOnchurchChurchRepository,

    @Inject(ONCHURCH_USER_REPOSITORY)
    private readonly userRepository: IOnchurchUserRepository,

    private readonly managerResolver: OnchurchChurchManagerResolver,
  ) {}

  // 다른 교회의 추천 코드를 입력한다. 1회만 가능하며 첫 결제가 확인된 뒤에는 막는다.
  // 보상(기간 연장)은 마스터가 교회 목록의 '추천' 열을 보고 수동으로 처리한다.
  async execute(userId: number, rawCode: string): Promise<OnchurchChurch> {
    const church = await this.managerResolver.resolveManagedChurch(userId);
    if (!church) throw new OnchurchChurchNotFound();
    if (church.referredByChurchId) throw new OnchurchReferralAlreadyApplied();

    const owner = await this.userRepository.findOneOrThrowById(church.ownerId);
    if (owner.paidUntil) throw new OnchurchReferralWindowClosed();

    const code = rawCode.trim().toUpperCase();
    if (!code) throw new OnchurchReferralCodeNotFound();

    const referrer = await this.churchRepository.findByReferralCode(code);
    if (!referrer) throw new OnchurchReferralCodeNotFound();
    if (referrer.id === church.id) throw new OnchurchReferralSelfNotAllowed();

    return this.churchRepository.updateReferredByChurchId(church.id, referrer.id);
  }
}
