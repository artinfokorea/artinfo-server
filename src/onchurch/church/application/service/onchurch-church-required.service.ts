import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ONCHURCH_CHURCH_REPOSITORY, IOnchurchChurchRepository } from '@/onchurch/church/domain/repository/onchurch-church.repository.interface';
import { OnchurchChurch } from '@/onchurch/church/domain/entity/onchurch-church.entity';
import { OnchurchPastor } from '@/onchurch/about/domain/entity/onchurch-pastor.entity';
import { OnchurchWorshipService } from '@/onchurch/worship/domain/entity/onchurch-worship-service.entity';
import { OnchurchChurchRequiredFieldsMissing } from '@/onchurch/church/domain/exception/onchurch-church.exception';
import { ONCHURCH_USER_REPOSITORY, IOnchurchUserRepository } from '@/onchurch/user/domain/repository/onchurch-user.repository.interface';

function hasChurchBaseFields(church: OnchurchChurch): boolean {
  return (
    !!church.slug?.trim() &&
    !!church.name?.trim() &&
    !!church.phone?.trim() &&
    !!church.email?.trim() &&
    !!church.address?.trim()
  );
}

@Injectable()
export class OnchurchChurchRequiredService {
  constructor(
    @Inject(ONCHURCH_CHURCH_REPOSITORY)
    private readonly churchRepository: IOnchurchChurchRepository,

    @InjectRepository(OnchurchPastor)
    private readonly pastorRepository: Repository<OnchurchPastor>,

    @InjectRepository(OnchurchWorshipService)
    private readonly worshipServiceRepository: Repository<OnchurchWorshipService>,

    @Inject(ONCHURCH_USER_REPOSITORY)
    private readonly userRepository: IOnchurchUserRepository,
  ) {}

  async hasAllRequired(church: OnchurchChurch): Promise<boolean> {
    if (!hasChurchBaseFields(church)) return false;

    // 테스트 교회(소유자 is_test)는 교회 소개·예배 안내를 메뉴에서 끌 수 있어 담임목사·예배를 요구하지 않는다.
    if (await this.isTestOwner(church.ownerId)) return true;

    const pastor = await this.pastorRepository.findOneBy({ churchId: church.id });
    if (!pastor || !pastor.name?.trim()) return false;

    const worshipCount = await this.worshipServiceRepository.count({ where: { churchId: church.id } });
    if (worshipCount === 0) return false;

    return true;
  }

  private async isTestOwner(ownerId: number): Promise<boolean> {
    try {
      const owner = await this.userRepository.findOneOrThrowById(ownerId);
      return !!owner.isTest;
    } catch {
      return false;
    }
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
