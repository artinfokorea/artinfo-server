import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SalpyeoFacility } from '@/salpyeo/facility/domain/entity/salpyeo-facility.entity';
import { SALPYEO_FACILITY_REPOSITORY } from '@/salpyeo/facility/domain/repository/salpyeo-facility.repository.interface';
import { SalpyeoFacilityRepository } from '@/salpyeo/facility/infrastructure/repository/salpyeo-facility.repository';
import { SalpyeoFacilityMemoryRepository } from '@/salpyeo/facility/infrastructure/repository/salpyeo-facility.memory.repository';
import { SalpyeoScanVerticalsUseCase } from '@/salpyeo/facility/application/usecase/salpyeo-scan-verticals.usecase';
import { SalpyeoGetVerticalUseCase } from '@/salpyeo/facility/application/usecase/salpyeo-get-vertical.usecase';
import { SalpyeoScanFacilitiesUseCase } from '@/salpyeo/facility/application/usecase/salpyeo-scan-facilities.usecase';
import { SalpyeoGetFacilityUseCase } from '@/salpyeo/facility/application/usecase/salpyeo-get-facility.usecase';
import { SalpyeoVerticalController } from '@/salpyeo/facility/presentation/controller/salpyeo-vertical.controller';
import { SalpyeoFacilityController } from '@/salpyeo/facility/presentation/controller/salpyeo-facility.controller';
import { isSalpyeoMemoryRepository } from '@/salpyeo/common/salpyeo-repository-mode';

export const SALPYEO_FACILITY_USE_CASES = [SalpyeoScanVerticalsUseCase, SalpyeoGetVerticalUseCase, SalpyeoScanFacilitiesUseCase, SalpyeoGetFacilityUseCase];
export const SALPYEO_FACILITY_CONTROLLERS = [SalpyeoVerticalController, SalpyeoFacilityController];

@Module({
  imports: isSalpyeoMemoryRepository() ? [] : [TypeOrmModule.forFeature([SalpyeoFacility])],
  controllers: SALPYEO_FACILITY_CONTROLLERS,
  providers: [
    ...SALPYEO_FACILITY_USE_CASES,
    isSalpyeoMemoryRepository()
      ? { provide: SALPYEO_FACILITY_REPOSITORY, useValue: new SalpyeoFacilityMemoryRepository() }
      : { provide: SALPYEO_FACILITY_REPOSITORY, useClass: SalpyeoFacilityRepository },
  ],
})
export class SalpyeoFacilityModule {}
