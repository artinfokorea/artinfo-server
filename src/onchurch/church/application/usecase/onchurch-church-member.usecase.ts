import { Inject, Injectable } from '@nestjs/common';
import { ONCHURCH_CHURCH_REPOSITORY, IOnchurchChurchRepository } from '@/onchurch/church/domain/repository/onchurch-church.repository.interface';
import { ONCHURCH_USER_REPOSITORY, IOnchurchUserRepository } from '@/onchurch/user/domain/repository/onchurch-user.repository.interface';
import { OnchurchUser } from '@/onchurch/user/domain/entity/onchurch-user.entity';
import { OnchurchUserNotFound } from '@/onchurch/user/domain/exception/onchurch-user.exception';

@Injectable()
export class OnchurchListChurchMembersUseCase {
  constructor(
    @Inject(ONCHURCH_CHURCH_REPOSITORY) private readonly churchRepository: IOnchurchChurchRepository,
    @Inject(ONCHURCH_USER_REPOSITORY) private readonly userRepository: IOnchurchUserRepository,
  ) {}
  async execute(ownerId: number): Promise<OnchurchUser[]> {
    const church = await this.churchRepository.findByOwnerId(ownerId);
    if (!church) return [];
    return this.userRepository.findMembersByChurchId(church.id);
  }
}

@Injectable()
export class OnchurchRemoveChurchMemberUseCase {
  constructor(
    @Inject(ONCHURCH_CHURCH_REPOSITORY) private readonly churchRepository: IOnchurchChurchRepository,
    @Inject(ONCHURCH_USER_REPOSITORY) private readonly userRepository: IOnchurchUserRepository,
  ) {}
  async execute(ownerId: number, memberId: number): Promise<void> {
    const church = await this.churchRepository.findByOwnerId(ownerId);
    if (!church) throw new OnchurchUserNotFound();
    const member = await this.userRepository.findMemberByChurchId(church.id, memberId);
    if (!member) throw new OnchurchUserNotFound();
    await this.userRepository.softDeleteById(memberId);
  }
}
