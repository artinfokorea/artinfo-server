import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OnchurchBulletin } from '@/onchurch/bulletin/domain/entity/onchurch-bulletin.entity';
import { ONCHURCH_BULLETIN_REPOSITORY } from '@/onchurch/bulletin/domain/repository/onchurch-bulletin.repository.interface';
import { OnchurchBulletinRepository } from '@/onchurch/bulletin/infrastructure/repository/onchurch-bulletin.repository';
import { OnchurchBulletinController } from '@/onchurch/bulletin/presentation/controller/onchurch-bulletin.controller';
import {
  OnchurchScanMyBulletinUseCase,
  OnchurchUpsertMyBulletinUseCase,
} from '@/onchurch/bulletin/application/usecase/onchurch-bulletin.usecase';
import { OnchurchChurchModule } from '@/onchurch/church/onchurch-church.module';

@Module({
  imports: [TypeOrmModule.forFeature([OnchurchBulletin]), OnchurchChurchModule],
  controllers: [OnchurchBulletinController],
  providers: [
    { provide: ONCHURCH_BULLETIN_REPOSITORY, useClass: OnchurchBulletinRepository },
    OnchurchScanMyBulletinUseCase,
    OnchurchUpsertMyBulletinUseCase,
  ],
})
export class OnchurchBulletinModule {}
