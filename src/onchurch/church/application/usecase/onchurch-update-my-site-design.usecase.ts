import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { ONCHURCH_CHURCH_REPOSITORY, IOnchurchChurchRepository } from '@/onchurch/church/domain/repository/onchurch-church.repository.interface';
import { OnchurchChurch } from '@/onchurch/church/domain/entity/onchurch-church.entity';
import { OnchurchChurchManagerResolver } from '@/onchurch/church/application/service/onchurch-church-manager.resolver';
import { OnchurchSiteDesignError, normalizeSiteDesign } from '@/onchurch/church/application/service/onchurch-site-design';

@Injectable()
export class OnchurchUpdateMySiteDesignUseCase {
  constructor(
    @Inject(ONCHURCH_CHURCH_REPOSITORY)
    private readonly churchRepository: IOnchurchChurchRepository,

    private readonly managerResolver: OnchurchChurchManagerResolver,
  ) {}

  // 교회 관리자가 '디자인' 화면에서 고른 섹션별 디자인 + 메인·포인트 색을 한 번에 저장한다(초안 → 적용).
  // upsert 와 경로를 나눈 이유는 site-template 과 같다 — 디자인만 바꾸는 요청이 다른 항목을 덮어쓰지 않게.
  async execute(userId: number, input: unknown): Promise<OnchurchChurch> {
    // 관리자(부관리자)도 바꿀 수 있도록 실제 교회 소유자(owner_id) 기준으로 동작한다.
    const ownerId = await this.managerResolver.resolveOwnerId(userId);
    let design;
    try {
      design = normalizeSiteDesign(input);
    } catch (e) {
      if (e instanceof OnchurchSiteDesignError) throw new BadRequestException(e.message);
      throw e;
    }
    return this.churchRepository.updateSiteDesign(ownerId, design);
  }
}
