import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OnchurchGallery } from '@/onchurch/gallery/domain/entity/onchurch-gallery.entity';
import { OnchurchGalleryCategory } from '@/onchurch/gallery/domain/entity/onchurch-gallery-category.entity';
import { ONCHURCH_GALLERY_REPOSITORY } from '@/onchurch/gallery/domain/repository/onchurch-gallery.repository.interface';
import { ONCHURCH_GALLERY_CATEGORY_REPOSITORY } from '@/onchurch/gallery/domain/repository/onchurch-gallery-category.repository.interface';
import { OnchurchGalleryRepository } from '@/onchurch/gallery/infrastructure/repository/onchurch-gallery.repository';
import { OnchurchGalleryCategoryRepository } from '@/onchurch/gallery/infrastructure/repository/onchurch-gallery-category.repository';
import { OnchurchGalleryController } from '@/onchurch/gallery/presentation/controller/onchurch-gallery.controller';
import { OnchurchGalleryCategoryController } from '@/onchurch/gallery/presentation/controller/onchurch-gallery-category.controller';
import { OnchurchPublicGalleryController } from '@/onchurch/gallery/presentation/controller/onchurch-public-gallery.controller';
import {
  OnchurchListMyGalleriesUseCase,
  OnchurchCreateMyGalleryUseCase,
  OnchurchUpdateMyGalleryUseCase,
  OnchurchDeleteMyGalleryUseCase,
} from '@/onchurch/gallery/application/usecase/onchurch-gallery.usecase';
import {
  OnchurchListMyGalleryCategoriesUseCase,
  OnchurchCreateMyGalleryCategoryUseCase,
  OnchurchUpdateMyGalleryCategoryUseCase,
  OnchurchDeleteMyGalleryCategoryUseCase,
} from '@/onchurch/gallery/application/usecase/onchurch-gallery-category.usecase';
import { OnchurchListPublicGalleryUseCase } from '@/onchurch/gallery/application/usecase/onchurch-list-public-gallery.usecase';
import { OnchurchChurchModule } from '@/onchurch/church/onchurch-church.module';

@Module({
  imports: [TypeOrmModule.forFeature([OnchurchGallery, OnchurchGalleryCategory]), OnchurchChurchModule],
  controllers: [OnchurchGalleryController, OnchurchGalleryCategoryController, OnchurchPublicGalleryController],
  providers: [
    { provide: ONCHURCH_GALLERY_REPOSITORY, useClass: OnchurchGalleryRepository },
    { provide: ONCHURCH_GALLERY_CATEGORY_REPOSITORY, useClass: OnchurchGalleryCategoryRepository },
    OnchurchListMyGalleriesUseCase,
    OnchurchCreateMyGalleryUseCase,
    OnchurchUpdateMyGalleryUseCase,
    OnchurchDeleteMyGalleryUseCase,
    OnchurchListMyGalleryCategoriesUseCase,
    OnchurchCreateMyGalleryCategoryUseCase,
    OnchurchUpdateMyGalleryCategoryUseCase,
    OnchurchDeleteMyGalleryCategoryUseCase,
    OnchurchListPublicGalleryUseCase,
  ],
})
export class OnchurchGalleryModule {}
