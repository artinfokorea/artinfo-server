import { Inject, Injectable } from '@nestjs/common';
import { ISalpyeoFacilityRepository, SALPYEO_FACILITY_REPOSITORY } from '@/salpyeo/facility/domain/repository/salpyeo-facility.repository.interface';
import { SalpyeoFacility } from '@/salpyeo/facility/domain/entity/salpyeo-facility.entity';
import { SalpyeoFacilityNotFound } from '@/salpyeo/facility/domain/exception/salpyeo-facility.exception';

@Injectable()
export class SalpyeoGetFacilityUseCase {
  constructor(
    @Inject(SALPYEO_FACILITY_REPOSITORY)
    private readonly facilityRepository: ISalpyeoFacilityRepository,
  ) {}

  async execute(slug: string): Promise<SalpyeoFacility> {
    const facility = await this.facilityRepository.findBySlug(slug);
    if (!facility) throw new SalpyeoFacilityNotFound();
    return facility;
  }
}
