import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
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
import { OnchurchLedgerEntry, OnchurchLedgerType } from '@/onchurch/master/domain/entity/onchurch-ledger-entry.entity';

async function assertMaster(userRepository: IOnchurchUserRepository, userId: number): Promise<void> {
  const user = await userRepository.findOneOrThrowById(userId);
  if (user.role !== ONCHURCH_USER_ROLE.MASTER) {
    throw new ForbiddenException('마스터 권한이 필요합니다.');
  }
}

@Injectable()
export class OnchurchCreateLedgerEntryUseCase {
  constructor(
    @Inject(ONCHURCH_USER_REPOSITORY) private readonly userRepository: IOnchurchUserRepository,
    @Inject(ONCHURCH_LEDGER_REPOSITORY) private readonly ledgerRepository: IOnchurchLedgerRepository,
  ) {}

  async execute(
    userId: number,
    params: { entryDate: string; type: OnchurchLedgerType; amount: number; category: string; memo: string | null },
  ): Promise<OnchurchLedgerEntry> {
    await assertMaster(this.userRepository, userId);
    const id = await this.ledgerRepository.create({ ...params, createdBy: userId });
    const entry = await this.ledgerRepository.findById(id);
    if (!entry) throw new NotFoundException('가계부 항목 저장에 실패했습니다.');
    return entry;
  }
}

@Injectable()
export class OnchurchListLedgerEntriesUseCase {
  constructor(
    @Inject(ONCHURCH_USER_REPOSITORY) private readonly userRepository: IOnchurchUserRepository,
    @Inject(ONCHURCH_LEDGER_REPOSITORY) private readonly ledgerRepository: IOnchurchLedgerRepository,
  ) {}

  async execute(
    userId: number,
    params: { month: string | null; page: number; size: number },
  ): Promise<{ items: OnchurchLedgerEntry[]; totalCount: number; summary: OnchurchLedgerSummary }> {
    await assertMaster(this.userRepository, userId);
    const [page, summary] = await Promise.all([
      this.ledgerRepository.findPage(params),
      this.ledgerRepository.summary({ month: params.month }),
    ]);
    return { items: page.items, totalCount: page.totalCount, summary };
  }
}

@Injectable()
export class OnchurchDeleteLedgerEntryUseCase {
  constructor(
    @Inject(ONCHURCH_USER_REPOSITORY) private readonly userRepository: IOnchurchUserRepository,
    @Inject(ONCHURCH_LEDGER_REPOSITORY) private readonly ledgerRepository: IOnchurchLedgerRepository,
  ) {}

  async execute(userId: number, id: number): Promise<void> {
    await assertMaster(this.userRepository, userId);
    const entry = await this.ledgerRepository.findById(id);
    if (!entry) throw new NotFoundException('가계부 항목을 찾을 수 없습니다.');
    await this.ledgerRepository.deleteById(id);
  }
}
