import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OnchurchPastor } from '@/onchurch/about/domain/entity/onchurch-pastor.entity';
import { OnchurchVision } from '@/onchurch/about/domain/entity/onchurch-vision.entity';
import { OnchurchHistory } from '@/onchurch/about/domain/entity/onchurch-history.entity';
import { OnchurchStaff } from '@/onchurch/about/domain/entity/onchurch-staff.entity';
import { ONCHURCH_PASTOR_REPOSITORY } from '@/onchurch/about/domain/repository/onchurch-pastor.repository.interface';
import { ONCHURCH_VISION_REPOSITORY } from '@/onchurch/about/domain/repository/onchurch-vision.repository.interface';
import { ONCHURCH_HISTORY_REPOSITORY } from '@/onchurch/about/domain/repository/onchurch-history.repository.interface';
import { ONCHURCH_STAFF_REPOSITORY } from '@/onchurch/about/domain/repository/onchurch-staff.repository.interface';
import { OnchurchPastorRepository } from '@/onchurch/about/infrastructure/repository/onchurch-pastor.repository';
import { OnchurchVisionRepository } from '@/onchurch/about/infrastructure/repository/onchurch-vision.repository';
import { OnchurchHistoryRepository } from '@/onchurch/about/infrastructure/repository/onchurch-history.repository';
import { OnchurchStaffRepository } from '@/onchurch/about/infrastructure/repository/onchurch-staff.repository';
import { OnchurchPastorController } from '@/onchurch/about/presentation/controller/onchurch-pastor.controller';
import { OnchurchVisionController } from '@/onchurch/about/presentation/controller/onchurch-vision.controller';
import { OnchurchHistoryController } from '@/onchurch/about/presentation/controller/onchurch-history.controller';
import { OnchurchStaffController } from '@/onchurch/about/presentation/controller/onchurch-staff.controller';
import { OnchurchPublicAboutController } from '@/onchurch/about/presentation/controller/onchurch-public-about.controller';
import {
  OnchurchScanMyPastorUseCase,
  OnchurchUpsertMyPastorUseCase,
} from '@/onchurch/about/application/usecase/onchurch-pastor.usecase';
import {
  OnchurchListMyVisionsUseCase,
  OnchurchCreateMyVisionUseCase,
  OnchurchUpdateMyVisionUseCase,
  OnchurchDeleteMyVisionUseCase,
} from '@/onchurch/about/application/usecase/onchurch-vision.usecase';
import {
  OnchurchListMyHistoriesUseCase,
  OnchurchCreateMyHistoryUseCase,
  OnchurchUpdateMyHistoryUseCase,
  OnchurchDeleteMyHistoryUseCase,
} from '@/onchurch/about/application/usecase/onchurch-history.usecase';
import {
  OnchurchListMyStaffsUseCase,
  OnchurchCreateMyStaffUseCase,
  OnchurchUpdateMyStaffUseCase,
  OnchurchDeleteMyStaffUseCase,
} from '@/onchurch/about/application/usecase/onchurch-staff.usecase';
import { OnchurchListPublicAboutUseCase } from '@/onchurch/about/application/usecase/onchurch-list-public-about.usecase';
import { OnchurchChurchModule } from '@/onchurch/church/onchurch-church.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([OnchurchPastor, OnchurchVision, OnchurchHistory, OnchurchStaff]),
    OnchurchChurchModule,
  ],
  controllers: [
    OnchurchPastorController,
    OnchurchVisionController,
    OnchurchHistoryController,
    OnchurchStaffController,
    OnchurchPublicAboutController,
  ],
  providers: [
    { provide: ONCHURCH_PASTOR_REPOSITORY, useClass: OnchurchPastorRepository },
    { provide: ONCHURCH_VISION_REPOSITORY, useClass: OnchurchVisionRepository },
    { provide: ONCHURCH_HISTORY_REPOSITORY, useClass: OnchurchHistoryRepository },
    { provide: ONCHURCH_STAFF_REPOSITORY, useClass: OnchurchStaffRepository },
    OnchurchScanMyPastorUseCase,
    OnchurchUpsertMyPastorUseCase,
    OnchurchListMyVisionsUseCase,
    OnchurchCreateMyVisionUseCase,
    OnchurchUpdateMyVisionUseCase,
    OnchurchDeleteMyVisionUseCase,
    OnchurchListMyHistoriesUseCase,
    OnchurchCreateMyHistoryUseCase,
    OnchurchUpdateMyHistoryUseCase,
    OnchurchDeleteMyHistoryUseCase,
    OnchurchListMyStaffsUseCase,
    OnchurchCreateMyStaffUseCase,
    OnchurchUpdateMyStaffUseCase,
    OnchurchDeleteMyStaffUseCase,
    OnchurchListPublicAboutUseCase,
  ],
  exports: [OnchurchUpsertMyPastorUseCase],
})
export class OnchurchAboutModule {}
