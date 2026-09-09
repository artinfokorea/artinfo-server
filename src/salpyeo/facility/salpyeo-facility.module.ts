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
import { SalpyeoAdminFacilityController } from '@/salpyeo/facility/presentation/controller/salpyeo-admin-facility.controller';
import {
  SalpyeoAdminGetFacilityUseCase,
  SalpyeoAdminScanFacilitiesUseCase,
  SalpyeoAdminUpdateFacilityUseCase,
} from '@/salpyeo/facility/application/usecase/salpyeo-admin-facility.usecase';
import { SalpyeoAdminUploadImageUseCase } from '@/salpyeo/facility/application/usecase/salpyeo-admin-upload-image.usecase';
import { SalpyeoAdminGuard } from '@/salpyeo/common/salpyeo-admin.guard';
import { AwsS3Service } from '@/aws/s3/aws-s3.service';
import { SalpyeoUserModule } from '@/salpyeo/user/salpyeo-user.module';
import { isSalpyeoMemoryRepository } from '@/salpyeo/common/salpyeo-repository-mode';

export const SALPYEO_FACILITY_USE_CASES = [SalpyeoScanVerticalsUseCase, SalpyeoGetVerticalUseCase, SalpyeoScanFacilitiesUseCase, SalpyeoGetFacilityUseCase];
export const SALPYEO_ADMIN_FACILITY_USE_CASES = [
  SalpyeoAdminScanFacilitiesUseCase,
  SalpyeoAdminGetFacilityUseCase,
  SalpyeoAdminUpdateFacilityUseCase,
  SalpyeoAdminUploadImageUseCase,
];
export const SALPYEO_FACILITY_CONTROLLERS = [SalpyeoVerticalController, SalpyeoFacilityController];

@Module({
  // 관리자 가드가 살펴 사용자 저장소로 role 을 확인한다
  imports: [SalpyeoUserModule, ...(isSalpyeoMemoryRepository() ? [] : [TypeOrmModule.forFeature([SalpyeoFacility])])],
  controllers: [...SALPYEO_FACILITY_CONTROLLERS, SalpyeoAdminFacilityController],
  providers: [
    ...SALPYEO_FACILITY_USE_CASES,
    ...SALPYEO_ADMIN_FACILITY_USE_CASES,
    SalpyeoAdminGuard,
    AwsS3Service,
    isSalpyeoMemoryRepository()
      ? { provide: SALPYEO_FACILITY_REPOSITORY, useValue: new SalpyeoFacilityMemoryRepository() }
      : { provide: SALPYEO_FACILITY_REPOSITORY, useClass: SalpyeoFacilityRepository },
  ],
})
export class SalpyeoFacilityModule {}
