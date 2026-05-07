import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OnchurchChurch } from '@/onchurch/church/domain/entity/onchurch-church.entity';
import { ONCHURCH_CHURCH_REPOSITORY } from '@/onchurch/church/domain/repository/onchurch-church.repository.interface';
import { OnchurchChurchRepository } from '@/onchurch/church/infrastructure/repository/onchurch-church.repository';
import { OnchurchChurchController } from '@/onchurch/church/presentation/controller/onchurch-church.controller';
import { OnchurchScanMyChurchUseCase } from '@/onchurch/church/application/usecase/onchurch-scan-my-church.usecase';
import { OnchurchUpsertMyChurchUseCase } from '@/onchurch/church/application/usecase/onchurch-upsert-my-church.usecase';
import { OnchurchPublishMyChurchUseCase } from '@/onchurch/church/application/usecase/onchurch-publish-my-church.usecase';
import { OnchurchCheckSlugUseCase } from '@/onchurch/church/application/usecase/onchurch-check-slug.usecase';
import { OnchurchUserModule } from '@/onchurch/user/onchurch-user.module';

@Module({
  imports: [TypeOrmModule.forFeature([OnchurchChurch]), OnchurchUserModule],
  controllers: [OnchurchChurchController],
  providers: [
    { provide: ONCHURCH_CHURCH_REPOSITORY, useClass: OnchurchChurchRepository },
    OnchurchScanMyChurchUseCase,
    OnchurchUpsertMyChurchUseCase,
    OnchurchPublishMyChurchUseCase,
    OnchurchCheckSlugUseCase,
  ],
  exports: [ONCHURCH_CHURCH_REPOSITORY],
})
export class OnchurchChurchModule {}
