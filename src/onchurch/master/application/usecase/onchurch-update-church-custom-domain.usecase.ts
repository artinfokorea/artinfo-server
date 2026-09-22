import { BadRequestException, ConflictException, ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IOnchurchUserRepository, ONCHURCH_USER_REPOSITORY } from '@/onchurch/user/domain/repository/onchurch-user.repository.interface';
import { ONCHURCH_USER_ROLE } from '@/onchurch/user/domain/entity/onchurch-user.entity';
import {
  IOnchurchChurchOverviewRepository,
  ONCHURCH_CHURCH_OVERVIEW_REPOSITORY,
} from '@/onchurch/master/domain/repository/onchurch-church-overview.repository.interface';
import { OnchurchCustomDomainError, normalizeCustomDomain } from '@/onchurch/church/application/service/onchurch-custom-domain';

@Injectable()
export class OnchurchUpdateChurchCustomDomainUseCase {
  constructor(
    @Inject(ONCHURCH_USER_REPOSITORY)
    private readonly userRepository: IOnchurchUserRepository,
    @Inject(ONCHURCH_CHURCH_OVERVIEW_REPOSITORY)
    private readonly churchOverviewRepository: IOnchurchChurchOverviewRepository,
  ) {}

  // 교회가 직접 보유한 도메인을 그 교회 홈페이지에 연결한다. 빈 값이면 연결 해제.
  //
  // 여기서 저장하는 것은 매핑뿐이다 — 실제로 접속되려면 Vercel 프로젝트 Domains 에 해당 호스트와
  // www 짝을 등록하고(자동 SSL) 교회 DNS 를 Vercel 로 바꾸는 작업이 함께 끝나야 한다.
  async execute(userId: number, churchId: number, customDomain: string | null): Promise<{ customDomain: string | null }> {
    const requester = await this.userRepository.findOneOrThrowById(userId);
    if (requester.role !== ONCHURCH_USER_ROLE.MASTER) {
      throw new ForbiddenException('마스터 권한이 필요합니다.');
    }

    let value: string | null;
    try {
      value = normalizeCustomDomain(customDomain);
    } catch (e) {
      if (e instanceof OnchurchCustomDomainError) throw new BadRequestException(e.message);
      throw e;
    }

    // 한 호스트는 한 교회에만 연결될 수 있다(DB 유니크 인덱스와 중복 방어).
    if (value) {
      const owner = await this.churchOverviewRepository.findChurchIdByCustomDomain(value);
      if (owner !== null && owner !== churchId) {
        throw new ConflictException('이미 다른 교회에 연결된 도메인입니다.');
      }
    }

    const updated = await this.churchOverviewRepository.updateCustomDomain(churchId, value);
    if (!updated) throw new NotFoundException('교회를 찾을 수 없습니다.');

    return { customDomain: value };
  }
}
