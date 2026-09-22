import { Inject, Injectable } from '@nestjs/common';
import { ONCHURCH_CHURCH_REPOSITORY, IOnchurchChurchRepository } from '@/onchurch/church/domain/repository/onchurch-church.repository.interface';

export type OnchurchCustomDomainMapping = {
  // 대표 호스트 (이 주소로 교회 홈페이지가 서빙된다)
  host: string;
  // 교회 slug
  slug: string;
};

@Injectable()
export class OnchurchListCustomDomainsUseCase {
  constructor(
    @Inject(ONCHURCH_CHURCH_REPOSITORY)
    private readonly churchRepository: IOnchurchChurchRepository,
  ) {}

  // 프론트 미들웨어가 요청 Host 로 교회를 찾기 위해 주기적으로 받아가는 전체 매핑.
  // 요청마다 조회하면 엣지→API 왕복이 생기므로, 프론트는 이 목록을 받아 메모리에 캐시한다.
  async execute(): Promise<OnchurchCustomDomainMapping[]> {
    const churches = await this.churchRepository.findAllWithCustomDomain();
    return churches.map(c => ({ host: (c.customDomain ?? '').trim().toLowerCase(), slug: c.slug })).filter(d => !!d.host && !!d.slug);
  }
}
