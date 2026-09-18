import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OnchurchCustomPage } from '@/onchurch/custom-page/domain/entity/onchurch-custom-page.entity';
import { ONCHURCH_CUSTOM_PAGE_REPOSITORY } from '@/onchurch/custom-page/domain/repository/onchurch-custom-page.repository.interface';
import { OnchurchCustomPageRepository } from '@/onchurch/custom-page/infrastructure/repository/onchurch-custom-page.repository';
import { OnchurchCustomPageController } from '@/onchurch/custom-page/presentation/controller/onchurch-custom-page.controller';
import { OnchurchPublicCustomPageController } from '@/onchurch/custom-page/presentation/controller/onchurch-public-custom-page.controller';
import {
  OnchurchListMyCustomPagesUseCase,
  OnchurchCreateMyCustomPageUseCase,
  OnchurchUpdateMyCustomPageUseCase,
  OnchurchToggleMyCustomPageUseCase,
  OnchurchReorderMyCustomPagesUseCase,
  OnchurchDeleteMyCustomPageUseCase,
  OnchurchListPublicCustomPagesUseCase,
  OnchurchGetPublicCustomPageUseCase,
} from '@/onchurch/custom-page/application/usecase/onchurch-custom-page.usecase';
import { OnchurchChurchModule } from '@/onchurch/church/onchurch-church.module';

@Module({
  imports: [TypeOrmModule.forFeature([OnchurchCustomPage]), OnchurchChurchModule],
  controllers: [OnchurchCustomPageController, OnchurchPublicCustomPageController],
  providers: [
    { provide: ONCHURCH_CUSTOM_PAGE_REPOSITORY, useClass: OnchurchCustomPageRepository },
    OnchurchListMyCustomPagesUseCase,
    OnchurchCreateMyCustomPageUseCase,
    OnchurchUpdateMyCustomPageUseCase,
    OnchurchToggleMyCustomPageUseCase,
    OnchurchReorderMyCustomPagesUseCase,
    OnchurchDeleteMyCustomPageUseCase,
    OnchurchListPublicCustomPagesUseCase,
    OnchurchGetPublicCustomPageUseCase,
  ],
})
export class OnchurchCustomPageModule {}
