import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import {
  IOnchurchUserRepository,
  ONCHURCH_USER_REPOSITORY,
} from '@/onchurch/user/domain/repository/onchurch-user.repository.interface';
import { ONCHURCH_USER_ROLE } from '@/onchurch/user/domain/entity/onchurch-user.entity';
import {
  IOnchurchChurchOverviewRepository,
  ONCHURCH_CHURCH_OVERVIEW_REPOSITORY,
  OnchurchChurchOverviewRow,
} from '@/onchurch/master/domain/repository/onchurch-church-overview.repository.interface';
import { PagingItems } from '@/common/type/type';

@Injectable()
export class OnchurchListChurchesUseCase {
  constructor(
    @Inject(ONCHURCH_USER_REPOSITORY)
    private readonly userRepository: IOnchurchUserRepository,
    @Inject(ONCHURCH_CHURCH_OVERVIEW_REPOSITORY)
    private readonly churchOverviewRepository: IOnchurchChurchOverviewRepository,
  ) {}

  async execute(
    userId: number,
    params: { keyword: string | null; page: number; size: number },
  ): Promise<PagingItems<OnchurchChurchOverviewRow>> {
    const user = await this.userRepository.findOneOrThrowById(userId);
    if (user.role !== ONCHURCH_USER_ROLE.MASTER) {
      throw new ForbiddenException('마스터 권한이 필요합니다.');
    }

    return this.churchOverviewRepository.findPage(params);
  }
}
