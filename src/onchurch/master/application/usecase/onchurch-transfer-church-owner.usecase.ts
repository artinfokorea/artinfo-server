import { BadRequestException, ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  IOnchurchUserRepository,
  ONCHURCH_USER_REPOSITORY,
} from '@/onchurch/user/domain/repository/onchurch-user.repository.interface';
import { ONCHURCH_USER_ROLE } from '@/onchurch/user/domain/entity/onchurch-user.entity';
import {
  IOnchurchChurchRepository,
  ONCHURCH_CHURCH_REPOSITORY,
} from '@/onchurch/church/domain/repository/onchurch-church.repository.interface';

export type TransferChurchOwnerResult = { ownerId: number; ownerName: string; ownerPhone: string };

/**
 * 교회 소유자(owner)를 기존 가입자에게 이관한다.
 *  - 새 소유자: OWNER로 승격하고 교회 소속으로 지정. 구독(프리티어·결제)은 교회에 귀속되므로 기존 소유자에게서 승계한다.
 *  - 기존 소유자: 같은 교회의 일반 멤버(MEMBER)로 강등하고 구독 상태는 회수한다.
 */
@Injectable()
export class OnchurchTransferChurchOwnerUseCase {
  constructor(
    @Inject(ONCHURCH_USER_REPOSITORY)
    private readonly userRepository: IOnchurchUserRepository,
    @Inject(ONCHURCH_CHURCH_REPOSITORY)
    private readonly churchRepository: IOnchurchChurchRepository,
  ) {}

  async execute(requesterId: number, churchId: number, targetUserId: number): Promise<TransferChurchOwnerResult> {
    const requester = await this.userRepository.findOneOrThrowById(requesterId);
    if (requester.role !== ONCHURCH_USER_ROLE.MASTER) {
      throw new ForbiddenException('마스터 권한이 필요합니다.');
    }

    const church = await this.churchRepository.findById(churchId);
    if (!church) throw new NotFoundException('교회를 찾을 수 없습니다.');

    if (church.ownerId === targetUserId) {
      throw new BadRequestException('이미 이 교회의 소유자입니다.');
    }

    const target = await this.userRepository.findOneOrThrowById(targetUserId);
    if (target.role === ONCHURCH_USER_ROLE.MASTER) {
      throw new BadRequestException('마스터 계정은 교회 소유자로 지정할 수 없습니다.');
    }

    const targetOwnedChurch = await this.churchRepository.findByOwnerId(targetUserId);
    if (targetOwnedChurch) {
      throw new BadRequestException('이 사용자는 이미 다른 교회의 소유자입니다.');
    }

    const oldOwner = await this.userRepository.findOneOrThrowById(church.ownerId);

    // 새 소유자: 승격 + 구독 승계
    target.role = ONCHURCH_USER_ROLE.OWNER;
    target.churchId = church.id;
    target.churchName = church.name;
    target.freeTrialUntil = oldOwner.freeTrialUntil;
    target.paidUntil = oldOwner.paidUntil;

    // 기존 소유자: 같은 교회의 일반 멤버로 강등 + 구독 회수
    oldOwner.role = ONCHURCH_USER_ROLE.MEMBER;
    oldOwner.churchId = church.id;
    oldOwner.churchName = church.name;
    oldOwner.freeTrialUntil = null;
    oldOwner.paidUntil = null;

    await this.churchRepository.updateOwnerId(church.id, target.id);
    await this.userRepository.saveEntity(target);
    await this.userRepository.saveEntity(oldOwner);

    return { ownerId: target.id, ownerName: target.name, ownerPhone: target.phone };
  }
}
