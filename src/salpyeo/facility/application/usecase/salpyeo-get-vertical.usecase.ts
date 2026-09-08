import { Inject, Injectable } from '@nestjs/common';
import { ISalpyeoFacilityRepository, SALPYEO_FACILITY_REPOSITORY } from '@/salpyeo/facility/domain/repository/salpyeo-facility.repository.interface';
import { findSalpyeoVertical, isSalpyeoVerticalKey } from '@/salpyeo/facility/domain/constant/salpyeo-vertical.constant';
import { SalpyeoVerticalNotFound } from '@/salpyeo/facility/domain/exception/salpyeo-facility.exception';
import { SalpyeoVerticalWithCount } from './salpyeo-scan-verticals.usecase';

@Injectable()
export class SalpyeoGetVerticalUseCase {
  constructor(
    @Inject(SALPYEO_FACILITY_REPOSITORY)
    private readonly facilityRepository: ISalpyeoFacilityRepository,
  ) {}

  async execute(key: string): Promise<SalpyeoVerticalWithCount> {
    if (!isSalpyeoVerticalKey(key)) throw new SalpyeoVerticalNotFound();
    const counts = await this.facilityRepository.countByVertical();
    return { ...findSalpyeoVertical(key), count: counts[key] ?? 0 };
  }
}
