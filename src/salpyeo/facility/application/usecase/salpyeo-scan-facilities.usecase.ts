import { Inject, Injectable } from '@nestjs/common';
import { ISalpyeoFacilityRepository, SALPYEO_FACILITY_REPOSITORY } from '@/salpyeo/facility/domain/repository/salpyeo-facility.repository.interface';
import { SalpyeoFacility } from '@/salpyeo/facility/domain/entity/salpyeo-facility.entity';
import { SalpyeoVerticalKey } from '@/salpyeo/facility/domain/constant/salpyeo-vertical.constant';
import {
  filterFacilitiesByKeyword,
  filterFacilitiesBySlugs,
  SalpyeoFacilitySort,
  sortFacilities,
} from '@/salpyeo/facility/domain/service/salpyeo-facility-query';

export interface SalpyeoScanFacilitiesQuery {
  vertical: SalpyeoVerticalKey;
  keyword?: string;
  /** 비교 리포트용 — 지정 시 해당 slug 만 반환 */
  slugs?: string[];
  sort?: SalpyeoFacilitySort;
}

@Injectable()
export class SalpyeoScanFacilitiesUseCase {
  constructor(
    @Inject(SALPYEO_FACILITY_REPOSITORY)
    private readonly facilityRepository: ISalpyeoFacilityRepository,
  ) {}

  async execute(query: SalpyeoScanFacilitiesQuery): Promise<SalpyeoFacility[]> {
    const items = await this.facilityRepository.findByVertical(query.vertical);
    const filtered = filterFacilitiesBySlugs(filterFacilitiesByKeyword(items, query.keyword), query.slugs);
    return sortFacilities(filtered, query.sort ?? 'priceAsc');
  }
}
