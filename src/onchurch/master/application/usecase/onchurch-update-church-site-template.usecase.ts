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
export class OnchurchUpdateChurchSiteTemplateUseCase {
  constructor(
    @Inject(ONCHURCH_USER_REPOSITORY)
    private readonly userRepository: IOnchurchUserRepository,
    @Inject(ONCHURCH_CHURCH_OVERVIEW_REPOSITORY)
    private readonly churchOverviewRepository: IOnchurchChurchOverviewRepository,
  ) {}

  // 교회의 공개 홈페이지 템플릿을 설정한다. 빈 값이면 'default'.
  // 템플릿 ID 화이트리스트는 두지 않는다 — 지원 목록은 프론트 템플릿 레지스트리가 단일 소스이며,
  // 미지원 값은 프론트에서 default로 폴백되므로 새 템플릿 추가 시 서버 배포가 필요 없다.
  async execute(userId: number, churchId: number, siteTemplate: string | null): Promise<{ siteTemplate: string }> {
    const requester = await this.userRepository.findOneOrThrowById(userId);
    if (requester.role !== ONCHURCH_USER_ROLE.MASTER) {
      throw new ForbiddenException('마스터 권한이 필요합니다.');
    }

    const value = siteTemplate?.trim() || 'default';
    const updated = await this.churchOverviewRepository.updateSiteTemplate(churchId, value);
    if (!updated) throw new NotFoundException('교회를 찾을 수 없습니다.');

    return { siteTemplate: value };
  }
}
