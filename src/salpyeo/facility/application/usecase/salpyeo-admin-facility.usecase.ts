import { Inject, Injectable } from '@nestjs/common';
import {
  ISalpyeoFacilityRepository,
  SALPYEO_FACILITY_REPOSITORY,
  SalpyeoFacilityPatch,
} from '@/salpyeo/facility/domain/repository/salpyeo-facility.repository.interface';
import { SalpyeoFacility } from '@/salpyeo/facility/domain/entity/salpyeo-facility.entity';
import { SalpyeoVerticalKey } from '@/salpyeo/facility/domain/constant/salpyeo-vertical.constant';
import { SalpyeoFacilityNotFound } from '@/salpyeo/facility/domain/exception/salpyeo-facility.exception';
import { filterFacilitiesByKeyword } from '@/salpyeo/facility/domain/service/salpyeo-facility-query';

/** 관리자 목록 — 노출을 내린 시설도 보여야 하므로 공개 목록과 저장소 호출이 다르다 */
@Injectable()
export class SalpyeoAdminScanFacilitiesUseCase {
  constructor(
    @Inject(SALPYEO_FACILITY_REPOSITORY)
    private readonly facilityRepository: ISalpyeoFacilityRepository,
  ) {}

  async execute(vertical: SalpyeoVerticalKey, keyword?: string): Promise<SalpyeoFacility[]> {
    const items = await this.facilityRepository.findByVerticalForAdmin(vertical);

    return filterFacilitiesByKeyword(items, keyword);
  }
}

@Injectable()
export class SalpyeoAdminGetFacilityUseCase {
  constructor(
    @Inject(SALPYEO_FACILITY_REPOSITORY)
    private readonly facilityRepository: ISalpyeoFacilityRepository,
  ) {}

  async execute(slug: string): Promise<SalpyeoFacility> {
    const facility = await this.facilityRepository.findBySlugForAdmin(slug);
    if (!facility) throw new SalpyeoFacilityNotFound();

    return facility;
  }
}

@Injectable()
export class SalpyeoAdminUpdateFacilityUseCase {
  constructor(
    @Inject(SALPYEO_FACILITY_REPOSITORY)
    private readonly facilityRepository: ISalpyeoFacilityRepository,
  ) {}

  async execute(slug: string, patch: SalpyeoFacilityPatch): Promise<SalpyeoFacility> {
    // 보내지 않은 필드는 건드리지 않는다 (부분 수정)
    const changes = Object.fromEntries(Object.entries(patch).filter(([, v]) => v !== undefined)) as SalpyeoFacilityPatch;
    if (Object.keys(changes).length === 0) return this.facilityRepository.update(slug, {});

    return this.facilityRepository.update(slug, changes);
  }
}
