import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OnchurchNotice } from '@/onchurch/notice/domain/entity/onchurch-notice.entity';
import { OnchurchNoticeCategory } from '@/onchurch/notice/domain/entity/onchurch-notice-category.entity';
import { ONCHURCH_NOTICE_REPOSITORY } from '@/onchurch/notice/domain/repository/onchurch-notice.repository.interface';
import { ONCHURCH_NOTICE_CATEGORY_REPOSITORY } from '@/onchurch/notice/domain/repository/onchurch-notice-category.repository.interface';
import { OnchurchNoticeRepository } from '@/onchurch/notice/infrastructure/repository/onchurch-notice.repository';
import { OnchurchNoticeCategoryRepository } from '@/onchurch/notice/infrastructure/repository/onchurch-notice-category.repository';
import { OnchurchNoticeController } from '@/onchurch/notice/presentation/controller/onchurch-notice.controller';
import { OnchurchNoticeCategoryController } from '@/onchurch/notice/presentation/controller/onchurch-notice-category.controller';
import { OnchurchPublicNoticeController } from '@/onchurch/notice/presentation/controller/onchurch-public-notice.controller';
import { OnchurchListMyNoticesUseCase } from '@/onchurch/notice/application/usecase/onchurch-list-my-notices.usecase';
import { OnchurchCreateMyNoticeUseCase } from '@/onchurch/notice/application/usecase/onchurch-create-my-notice.usecase';
import { OnchurchUpdateMyNoticeUseCase } from '@/onchurch/notice/application/usecase/onchurch-update-my-notice.usecase';
import { OnchurchDeleteMyNoticeUseCase } from '@/onchurch/notice/application/usecase/onchurch-delete-my-notice.usecase';
import { OnchurchListPublicNoticesUseCase } from '@/onchurch/notice/application/usecase/onchurch-list-public-notices.usecase';
import {
  OnchurchListMyNoticeCategoriesUseCase,
  OnchurchCreateMyNoticeCategoryUseCase,
  OnchurchUpdateMyNoticeCategoryUseCase,
  OnchurchDeleteMyNoticeCategoryUseCase,
} from '@/onchurch/notice/application/usecase/onchurch-notice-category.usecase';
import { OnchurchChurchModule } from '@/onchurch/church/onchurch-church.module';

@Module({
  imports: [TypeOrmModule.forFeature([OnchurchNotice, OnchurchNoticeCategory]), OnchurchChurchModule],
  controllers: [OnchurchNoticeController, OnchurchNoticeCategoryController, OnchurchPublicNoticeController],
  providers: [
    { provide: ONCHURCH_NOTICE_REPOSITORY, useClass: OnchurchNoticeRepository },
    { provide: ONCHURCH_NOTICE_CATEGORY_REPOSITORY, useClass: OnchurchNoticeCategoryRepository },
    OnchurchListMyNoticesUseCase,
    OnchurchCreateMyNoticeUseCase,
    OnchurchUpdateMyNoticeUseCase,
    OnchurchDeleteMyNoticeUseCase,
    OnchurchListPublicNoticesUseCase,
    OnchurchListMyNoticeCategoriesUseCase,
    OnchurchCreateMyNoticeCategoryUseCase,
    OnchurchUpdateMyNoticeCategoryUseCase,
    OnchurchDeleteMyNoticeCategoryUseCase,
  ],
})
export class OnchurchNoticeModule {}
