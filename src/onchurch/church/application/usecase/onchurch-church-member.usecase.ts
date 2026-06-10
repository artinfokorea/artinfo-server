import { Inject, Injectable } from '@nestjs/common';
import { ONCHURCH_USER_REPOSITORY, IOnchurchUserRepository } from '@/onchurch/user/domain/repository/onchurch-user.repository.interface';
import { OnchurchUser, ONCHURCH_USER_ROLE } from '@/onchurch/user/domain/entity/onchurch-user.entity';
import { OnchurchUserNotFound } from '@/onchurch/user/domain/exception/onchurch-user.exception';
import { OnchurchChurchManagerResolver } from '@/onchurch/church/application/service/onchurch-church-manager.resolver';
import { OnchurchChurchManagementForbidden, OnchurchOwnerGradeImmutable } from '@/onchurch/church/domain/exception/onchurch-church.exception';

@Injectable()
export class OnchurchListChurchMembersUseCase {
  constructor(
    @Inject(ONCHURCH_USER_REPOSITORY) private readonly userRepository: IOnchurchUserRepository,
    private readonly managerResolver: OnchurchChurchManagerResolver,
  ) {}
  async execute(actingUserId: number): Promise<{ users: OnchurchUser[]; churchOwnerId: number | null }> {
    const church = await this.managerResolver.resolveManagedChurch(actingUserId);
    if (!church) return { users: [], churchOwnerId: null };

    const owner = await this.userRepository.findOneOrThrowById(church.ownerId);
    const members = await this.userRepository.findMembersByChurchId(church.id);
    // 오너를 맨 앞에 두고, 혹시 members 에 오너가 섞여 있으면 중복 제거.
    return { users: [owner, ...members.filter((m) => m.id !== church.ownerId)], churchOwnerId: church.ownerId };
  }
}

@Injectable()
export class OnchurchRemoveChurchMemberUseCase {
  constructor(
    @Inject(ONCHURCH_USER_REPOSITORY) private readonly userRepository: IOnchurchUserRepository,
    private readonly managerResolver: OnchurchChurchManagerResolver,
  ) {}
  async execute(actingUserId: number, memberId: number): Promise<void> {
    const church = await this.managerResolver.resolveManagedChurch(actingUserId);
    if (!church) throw new OnchurchChurchManagementForbidden();
    if (memberId === church.ownerId) throw new OnchurchOwnerGradeImmutable();
    const member = await this.userRepository.findMemberByChurchId(church.id, memberId);
    if (!member) throw new OnchurchUserNotFound();
    await this.userRepository.softDeleteById(memberId);
  }
}

@Injectable()
export class OnchurchChangeChurchMemberRoleUseCase {
  constructor(
    @Inject(ONCHURCH_USER_REPOSITORY) private readonly userRepository: IOnchurchUserRepository,
    private readonly managerResolver: OnchurchChurchManagerResolver,
  ) {}
  async execute(actingUserId: number, targetId: number, role: 'admin' | 'member'): Promise<void> {
    const church = await this.managerResolver.resolveManagedChurch(actingUserId);
    if (!church) throw new OnchurchChurchManagementForbidden();
    if (targetId === church.ownerId) throw new OnchurchOwnerGradeImmutable();
    const member = await this.userRepository.findMemberByChurchId(church.id, targetId);
    if (!member) throw new OnchurchUserNotFound();
    member.role = role === 'admin' ? ONCHURCH_USER_ROLE.ADMIN : ONCHURCH_USER_ROLE.MEMBER;
    await this.userRepository.saveEntity(member);
  }
}
