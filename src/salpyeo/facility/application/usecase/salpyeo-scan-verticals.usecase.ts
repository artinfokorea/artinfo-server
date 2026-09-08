import { Inject, Injectable } from '@nestjs/common';
import { ISalpyeoFacilityRepository, SALPYEO_FACILITY_REPOSITORY } from '@/salpyeo/facility/domain/repository/salpyeo-facility.repository.interface';
import { SALPYEO_VERTICALS, SalpyeoVerticalMeta } from '@/salpyeo/facility/domain/constant/salpyeo-vertical.constant';

export type SalpyeoVerticalWithCount = SalpyeoVerticalMeta & { count: number };

@Injectable()
export class SalpyeoScanVerticalsUseCase {
  constructor(
    @Inject(SALPYEO_FACILITY_REPOSITORY)
    private readonly facilityRepository: ISalpyeoFacilityRepository,
  ) {}

  async execute(): Promise<SalpyeoVerticalWithCount[]> {
    const counts = await this.facilityRepository.countByVertical();
    return SALPYEO_VERTICALS.map(v => ({ ...v, count: counts[v.key] ?? 0 }));
  }
}
