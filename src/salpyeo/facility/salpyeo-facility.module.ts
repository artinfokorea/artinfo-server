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

/** 로컬에서 Postgres 없이 확인할 때 `SALPYEO_REPOSITORY=memory` (운영 워크플로는 주입하지 않음) */
const useMemoryRepository = process.env['SALPYEO_REPOSITORY'] === 'memory';

export const SALPYEO_FACILITY_USE_CASES = [SalpyeoScanVerticalsUseCase, SalpyeoGetVerticalUseCase, SalpyeoScanFacilitiesUseCase, SalpyeoGetFacilityUseCase];
export const SALPYEO_FACILITY_CONTROLLERS = [SalpyeoVerticalController, SalpyeoFacilityController];

@Module({
  imports: useMemoryRepository ? [] : [TypeOrmModule.forFeature([SalpyeoFacility])],
  controllers: SALPYEO_FACILITY_CONTROLLERS,
  providers: [
    ...SALPYEO_FACILITY_USE_CASES,
    useMemoryRepository
      ? { provide: SALPYEO_FACILITY_REPOSITORY, useValue: new SalpyeoFacilityMemoryRepository() }
      : { provide: SALPYEO_FACILITY_REPOSITORY, useClass: SalpyeoFacilityRepository },
  ],
})
export class SalpyeoFacilityModule {}
