import { Inject, Injectable } from '@nestjs/common';
import { ONCHURCH_CHURCH_REPOSITORY, IOnchurchChurchRepository } from '@/onchurch/church/domain/repository/onchurch-church.repository.interface';
import { OnchurchChurch } from '@/onchurch/church/domain/entity/onchurch-church.entity';
import { OnchurchChurchManagerResolver } from '@/onchurch/church/application/service/onchurch-church-manager.resolver';

@Injectable()
export class OnchurchUpdateMySiteTemplateUseCase {
  constructor(
    @Inject(ONCHURCH_CHURCH_REPOSITORY)
    private readonly churchRepository: IOnchurchChurchRepository,

    private readonly managerResolver: OnchurchChurchManagerResolver,
  ) {}

  // 교회 스스로 공개 홈페이지 템플릿을 고른다(마스터 전용 엔드포인트와 같은 값을 다룬다).
  // 교회 정보 저장(upsert)과 경로를 나눈 이유: upsert는 필드를 통째로 덮어쓰므로
  // 템플릿만 바꾸는 요청이 다른 항목에 영향을 주지 않게 하기 위함이다.
  //
  // 템플릿 ID 화이트리스트는 두지 않는다 — 지원 목록은 프론트 템플릿 레지스트리가 단일 소스이며,
  // 미지원 값은 프론트에서 default로 폴백되므로 새 템플릿 추가 시 서버 배포가 필요 없다.
  async execute(userId: number, siteTemplate: string | null): Promise<OnchurchChurch> {
    // 관리자도 바꿀 수 있도록 실제 교회 소유자(owner_id) 기준으로 동작한다.
    const ownerId = await this.managerResolver.resolveOwnerId(userId);
    const value = siteTemplate?.trim() || 'default';
    return this.churchRepository.updateSiteTemplate(ownerId, value);
  }
}
