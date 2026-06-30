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
export class OnchurchUpdateChurchNaverVerificationUseCase {
  constructor(
    @Inject(ONCHURCH_USER_REPOSITORY)
    private readonly userRepository: IOnchurchUserRepository,
    @Inject(ONCHURCH_CHURCH_OVERVIEW_REPOSITORY)
    private readonly churchOverviewRepository: IOnchurchChurchOverviewRepository,
  ) {}

  // 교회의 네이버 사이트 인증 코드를 설정한다. 공백은 trim, 빈 값이면 null(해제).
  async execute(userId: number, churchId: number, naverVerification: string | null): Promise<{ naverVerification: string | null }> {
    const requester = await this.userRepository.findOneOrThrowById(userId);
    if (requester.role !== ONCHURCH_USER_ROLE.MASTER) {
      throw new ForbiddenException('마스터 권한이 필요합니다.');
    }

    const value = naverVerification?.trim() || null;
    const updated = await this.churchOverviewRepository.updateNaverVerification(churchId, value);
    if (!updated) throw new NotFoundException('교회를 찾을 수 없습니다.');

    return { naverVerification: value };
  }
}
