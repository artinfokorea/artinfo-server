import { Inject, Injectable } from '@nestjs/common';
import { ONCHURCH_CHURCH_REPOSITORY, IOnchurchChurchRepository } from '@/onchurch/church/domain/repository/onchurch-church.repository.interface';
import { OnchurchChurch } from '@/onchurch/church/domain/entity/onchurch-church.entity';
import { OnchurchChurchRequiredFieldsMissing } from '@/onchurch/church/domain/exception/onchurch-church.exception';

function hasChurchBaseFields(church: OnchurchChurch): boolean {
  return !!church.slug?.trim() && !!church.name?.trim() && !!church.phone?.trim() && !!church.email?.trim() && !!church.address?.trim();
}

/**
 * 사이트 공개 필수 조건 — 기본 정보(서브도메인·이름)와 연락처(전화·이메일·주소).
 * 담임목사·예배 안내는 새 관리자 화면에서 메뉴로 끌 수 있어 요구하지 않는다 (2026-11-23 모든 교회에 적용).
 */
@Injectable()
export class OnchurchChurchRequiredService {
  constructor(
    @Inject(ONCHURCH_CHURCH_REPOSITORY)
    private readonly churchRepository: IOnchurchChurchRepository,
  ) {}

  async hasAllRequired(church: OnchurchChurch): Promise<boolean> {
    return hasChurchBaseFields(church);
  }

  async validateOrThrow(church: OnchurchChurch): Promise<void> {
    const ok = await this.hasAllRequired(church);
    if (!ok) throw new OnchurchChurchRequiredFieldsMissing();
  }

  // 운영 중인 사이트가 mutation 후 필수정보를 잃었을 때 자동으로 운영 OFF
  async autoUnpublishIfMissing(church: OnchurchChurch): Promise<void> {
    if (!church.isPublished) return;
    const ok = await this.hasAllRequired(church);
    if (ok) return;
    await this.churchRepository.updatePublished(church.ownerId, false);
  }

  async autoUnpublishIfMissingByOwner(ownerId: number): Promise<void> {
    const church = await this.churchRepository.findByOwnerId(ownerId);
    if (!church) return;
    await this.autoUnpublishIfMissing(church);
  }
}
