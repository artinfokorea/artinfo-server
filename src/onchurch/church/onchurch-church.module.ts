import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OnchurchChurch } from '@/onchurch/church/domain/entity/onchurch-church.entity';
import { OnchurchPastor } from '@/onchurch/about/domain/entity/onchurch-pastor.entity';
import { OnchurchWorshipService } from '@/onchurch/worship/domain/entity/onchurch-worship-service.entity';
import { ONCHURCH_CHURCH_REPOSITORY } from '@/onchurch/church/domain/repository/onchurch-church.repository.interface';
import { OnchurchChurchRepository } from '@/onchurch/church/infrastructure/repository/onchurch-church.repository';
import { OnchurchChurchController } from '@/onchurch/church/presentation/controller/onchurch-church.controller';
import { OnchurchPublicChurchController } from '@/onchurch/church/presentation/controller/onchurch-public-church.controller';
import { OnchurchScanMyChurchUseCase } from '@/onchurch/church/application/usecase/onchurch-scan-my-church.usecase';
import { OnchurchUpsertMyChurchUseCase } from '@/onchurch/church/application/usecase/onchurch-upsert-my-church.usecase';
import { OnchurchPublishMyChurchUseCase } from '@/onchurch/church/application/usecase/onchurch-publish-my-church.usecase';
import { OnchurchCheckSlugUseCase } from '@/onchurch/church/application/usecase/onchurch-check-slug.usecase';
import { OnchurchGetPublicChurchUseCase } from '@/onchurch/church/application/usecase/onchurch-get-public-church.usecase';
import { OnchurchChurchRequiredService } from '@/onchurch/church/application/service/onchurch-church-required.service';
import { OnchurchUserModule } from '@/onchurch/user/onchurch-user.module';

@Module({
  imports: [TypeOrmModule.forFeature([OnchurchChurch, OnchurchPastor, OnchurchWorshipService]), OnchurchUserModule],
  controllers: [OnchurchChurchController, OnchurchPublicChurchController],
  providers: [
    { provide: ONCHURCH_CHURCH_REPOSITORY, useClass: OnchurchChurchRepository },
    OnchurchScanMyChurchUseCase,
    OnchurchUpsertMyChurchUseCase,
    OnchurchPublishMyChurchUseCase,
    OnchurchCheckSlugUseCase,
    OnchurchGetPublicChurchUseCase,
    OnchurchChurchRequiredService,
  ],
  exports: [ONCHURCH_CHURCH_REPOSITORY, OnchurchChurchRequiredService],
})
export class OnchurchChurchModule {}
