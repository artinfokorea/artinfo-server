import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  IOnchurchUserRepository,
  ONCHURCH_USER_REPOSITORY,
} from '@/onchurch/user/domain/repository/onchurch-user.repository.interface';
import { ONCHURCH_USER_ROLE } from '@/onchurch/user/domain/entity/onchurch-user.entity';
import {
  IOnchurchChurchOverviewRepository,
  ONCHURCH_CHURCH_OVERVIEW_REPOSITORY,
} from '@/onchurch/master/domain/repository/onchurch-church-overview.repository.interface';

@Injectable()
export class OnchurchUpdateChurchPaidUntilUseCase {
  constructor(
    @Inject(ONCHURCH_USER_REPOSITORY)
    private readonly userRepository: IOnchurchUserRepository,
    @Inject(ONCHURCH_CHURCH_OVERVIEW_REPOSITORY)
    private readonly churchOverviewRepository: IOnchurchChurchOverviewRepository,
  ) {}

  // 교회 소유자(owner)의 결제 만료일(paid_until)을 절대값으로 설정한다. null이면 해제.
  async execute(userId: number, churchId: number, paidUntil: Date | null): Promise<{ paidUntil: Date | null }> {
    const requester = await this.userRepository.findOneOrThrowById(userId);
    if (requester.role !== ONCHURCH_USER_ROLE.MASTER) {
      throw new ForbiddenException('마스터 권한이 필요합니다.');
    }

    const ownerId = await this.churchOverviewRepository.findOwnerIdByChurchId(churchId);
    if (!ownerId) throw new NotFoundException('교회를 찾을 수 없습니다.');

    const owner = await this.userRepository.findOneOrThrowById(ownerId);
    owner.paidUntil = paidUntil;
    await this.userRepository.saveEntity(owner);

    return { paidUntil: owner.paidUntil };
  }
}
