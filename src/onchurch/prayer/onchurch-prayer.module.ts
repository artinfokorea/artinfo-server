import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OnchurchPrayerRequest } from '@/onchurch/prayer/domain/entity/onchurch-prayer-request.entity';
import { ONCHURCH_PRAYER_REPOSITORY } from '@/onchurch/prayer/domain/repository/onchurch-prayer.repository.interface';
import { OnchurchPrayerRepository } from '@/onchurch/prayer/infrastructure/repository/onchurch-prayer.repository';
import { OnchurchSubmitPublicPrayerUseCase } from '@/onchurch/prayer/application/usecase/onchurch-submit-public-prayer.usecase';
import {
  OnchurchListMyPrayersUseCase,
  OnchurchUpdateMyPrayerStatusUseCase,
  OnchurchDeleteMyPrayerUseCase,
} from '@/onchurch/prayer/application/usecase/onchurch-prayer-admin.usecase';
import { OnchurchPublicPrayerController } from '@/onchurch/prayer/presentation/controller/onchurch-public-prayer.controller';
import { OnchurchPrayerController } from '@/onchurch/prayer/presentation/controller/onchurch-prayer.controller';
import { OnchurchChurchModule } from '@/onchurch/church/onchurch-church.module';

@Module({
  imports: [TypeOrmModule.forFeature([OnchurchPrayerRequest]), OnchurchChurchModule],
  controllers: [OnchurchPublicPrayerController, OnchurchPrayerController],
  providers: [
    { provide: ONCHURCH_PRAYER_REPOSITORY, useClass: OnchurchPrayerRepository },
    OnchurchSubmitPublicPrayerUseCase,
    OnchurchListMyPrayersUseCase,
    OnchurchUpdateMyPrayerStatusUseCase,
    OnchurchDeleteMyPrayerUseCase,
  ],
})
export class OnchurchPrayerModule {}
