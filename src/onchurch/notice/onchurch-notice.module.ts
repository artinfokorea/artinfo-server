import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OnchurchNotice } from '@/onchurch/notice/domain/entity/onchurch-notice.entity';
import { ONCHURCH_NOTICE_REPOSITORY } from '@/onchurch/notice/domain/repository/onchurch-notice.repository.interface';
import { OnchurchNoticeRepository } from '@/onchurch/notice/infrastructure/repository/onchurch-notice.repository';
import { OnchurchNoticeController } from '@/onchurch/notice/presentation/controller/onchurch-notice.controller';
import { OnchurchPublicNoticeController } from '@/onchurch/notice/presentation/controller/onchurch-public-notice.controller';
import { OnchurchListMyNoticesUseCase } from '@/onchurch/notice/application/usecase/onchurch-list-my-notices.usecase';
import { OnchurchCreateMyNoticeUseCase } from '@/onchurch/notice/application/usecase/onchurch-create-my-notice.usecase';
import { OnchurchUpdateMyNoticeUseCase } from '@/onchurch/notice/application/usecase/onchurch-update-my-notice.usecase';
import { OnchurchDeleteMyNoticeUseCase } from '@/onchurch/notice/application/usecase/onchurch-delete-my-notice.usecase';
import { OnchurchListPublicNoticesUseCase } from '@/onchurch/notice/application/usecase/onchurch-list-public-notices.usecase';
import { OnchurchChurchModule } from '@/onchurch/church/onchurch-church.module';

@Module({
  imports: [TypeOrmModule.forFeature([OnchurchNotice]), OnchurchChurchModule],
  controllers: [OnchurchNoticeController, OnchurchPublicNoticeController],
  providers: [
    { provide: ONCHURCH_NOTICE_REPOSITORY, useClass: OnchurchNoticeRepository },
    OnchurchListMyNoticesUseCase,
    OnchurchCreateMyNoticeUseCase,
    OnchurchUpdateMyNoticeUseCase,
    OnchurchDeleteMyNoticeUseCase,
    OnchurchListPublicNoticesUseCase,
  ],
})
export class OnchurchNoticeModule {}
