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
export class OnchurchUpdateChurchGoogleVerificationUseCase {
  constructor(
    @Inject(ONCHURCH_USER_REPOSITORY)
    private readonly userRepository: IOnchurchUserRepository,
    @Inject(ONCHURCH_CHURCH_OVERVIEW_REPOSITORY)
    private readonly churchOverviewRepository: IOnchurchChurchOverviewRepository,
  ) {}

  // 교회의 구글 서치콘솔 인증 코드를 설정한다. 공백은 trim, 빈 값이면 null(해제).
  async execute(userId: number, churchId: number, googleVerification: string | null): Promise<{ googleVerification: string | null }> {
    const requester = await this.userRepository.findOneOrThrowById(userId);
    if (requester.role !== ONCHURCH_USER_ROLE.MASTER) {
      throw new ForbiddenException('마스터 권한이 필요합니다.');
    }

    const value = googleVerification?.trim() || null;
    const updated = await this.churchOverviewRepository.updateGoogleVerification(churchId, value);
    if (!updated) throw new NotFoundException('교회를 찾을 수 없습니다.');

    return { googleVerification: value };
  }
}
