import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OnchurchBanner } from '@/onchurch/banner/domain/entity/onchurch-banner.entity';
import { ONCHURCH_BANNER_REPOSITORY } from '@/onchurch/banner/domain/repository/onchurch-banner.repository.interface';
import { OnchurchBannerRepository } from '@/onchurch/banner/infrastructure/repository/onchurch-banner.repository';
import { OnchurchBannerController } from '@/onchurch/banner/presentation/controller/onchurch-banner.controller';
import { OnchurchPublicBannerController } from '@/onchurch/banner/presentation/controller/onchurch-public-banner.controller';
import { OnchurchListMyBannersUseCase } from '@/onchurch/banner/application/usecase/onchurch-list-my-banners.usecase';
import { OnchurchCreateMyBannerUseCase } from '@/onchurch/banner/application/usecase/onchurch-create-my-banner.usecase';
import { OnchurchUpdateMyBannerUseCase } from '@/onchurch/banner/application/usecase/onchurch-update-my-banner.usecase';
import { OnchurchDeleteMyBannerUseCase } from '@/onchurch/banner/application/usecase/onchurch-delete-my-banner.usecase';
import { OnchurchListPublicBannersUseCase } from '@/onchurch/banner/application/usecase/onchurch-list-public-banners.usecase';
import { OnchurchChurchModule } from '@/onchurch/church/onchurch-church.module';

@Module({
  imports: [TypeOrmModule.forFeature([OnchurchBanner]), OnchurchChurchModule],
  controllers: [OnchurchBannerController, OnchurchPublicBannerController],
  providers: [
    { provide: ONCHURCH_BANNER_REPOSITORY, useClass: OnchurchBannerRepository },
    OnchurchListMyBannersUseCase,
    OnchurchCreateMyBannerUseCase,
    OnchurchUpdateMyBannerUseCase,
    OnchurchDeleteMyBannerUseCase,
    OnchurchListPublicBannersUseCase,
  ],
})
export class OnchurchBannerModule {}
