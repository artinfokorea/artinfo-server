import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OnchurchSaint } from '@/onchurch/saint/domain/entity/onchurch-saint.entity';
import { OnchurchSaintRelation } from '@/onchurch/saint/domain/entity/onchurch-saint-relation.entity';
import { OnchurchSaintPrayer } from '@/onchurch/saint/domain/entity/onchurch-saint-prayer.entity';
import { OnchurchSaintTag } from '@/onchurch/saint/domain/entity/onchurch-saint-tag.entity';
import { OnchurchSaintTagLink } from '@/onchurch/saint/domain/entity/onchurch-saint-tag-link.entity';
import { ONCHURCH_SAINT_REPOSITORY } from '@/onchurch/saint/domain/repository/onchurch-saint.repository.interface';
import { ONCHURCH_SAINT_RELATION_REPOSITORY } from '@/onchurch/saint/domain/repository/onchurch-saint-relation.repository.interface';
import { ONCHURCH_SAINT_PRAYER_REPOSITORY } from '@/onchurch/saint/domain/repository/onchurch-saint-prayer.repository.interface';
import { ONCHURCH_SAINT_TAG_REPOSITORY } from '@/onchurch/saint/domain/repository/onchurch-saint-tag.repository.interface';
import { ONCHURCH_SAINT_TAG_LINK_REPOSITORY } from '@/onchurch/saint/domain/repository/onchurch-saint-tag-link.repository.interface';
import { OnchurchSaintRepository } from '@/onchurch/saint/infrastructure/repository/onchurch-saint.repository';
import { OnchurchSaintRelationRepository } from '@/onchurch/saint/infrastructure/repository/onchurch-saint-relation.repository';
import { OnchurchSaintPrayerRepository } from '@/onchurch/saint/infrastructure/repository/onchurch-saint-prayer.repository';
import { OnchurchSaintTagRepository } from '@/onchurch/saint/infrastructure/repository/onchurch-saint-tag.repository';
import { OnchurchSaintTagLinkRepository } from '@/onchurch/saint/infrastructure/repository/onchurch-saint-tag-link.repository';
import { OnchurchSaintController } from '@/onchurch/saint/presentation/controller/onchurch-saint.controller';
import {
  OnchurchListMySaintsUseCase,
  OnchurchCreateMySaintUseCase,
  OnchurchUpdateMySaintUseCase,
  OnchurchUpdateMySaintMemoUseCase,
  OnchurchUpdateMySaintFavoriteUseCase,
  OnchurchDeleteMySaintUseCase,
} from '@/onchurch/saint/application/usecase/onchurch-saint.usecase';
import {
  OnchurchListMySaintRelationsUseCase,
  OnchurchCreateMySaintRelationUseCase,
  OnchurchDeleteMySaintRelationUseCase,
} from '@/onchurch/saint/application/usecase/onchurch-saint-relation.usecase';
import {
  OnchurchListMySaintPrayersUseCase,
  OnchurchCreateMySaintPrayerUseCase,
  OnchurchDeleteMySaintPrayerUseCase,
} from '@/onchurch/saint/application/usecase/onchurch-saint-prayer.usecase';
import {
  OnchurchListMySaintTagsUseCase,
  OnchurchCreateMySaintTagUseCase,
  OnchurchDeleteMySaintTagUseCase,
  OnchurchSetMySaintTagsUseCase,
} from '@/onchurch/saint/application/usecase/onchurch-saint-tag.usecase';
import { OnchurchChurchModule } from '@/onchurch/church/onchurch-church.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([OnchurchSaint, OnchurchSaintRelation, OnchurchSaintPrayer, OnchurchSaintTag, OnchurchSaintTagLink]),
    OnchurchChurchModule,
  ],
  controllers: [OnchurchSaintController],
  providers: [
    { provide: ONCHURCH_SAINT_REPOSITORY, useClass: OnchurchSaintRepository },
    { provide: ONCHURCH_SAINT_RELATION_REPOSITORY, useClass: OnchurchSaintRelationRepository },
    { provide: ONCHURCH_SAINT_PRAYER_REPOSITORY, useClass: OnchurchSaintPrayerRepository },
    { provide: ONCHURCH_SAINT_TAG_REPOSITORY, useClass: OnchurchSaintTagRepository },
    { provide: ONCHURCH_SAINT_TAG_LINK_REPOSITORY, useClass: OnchurchSaintTagLinkRepository },
    OnchurchListMySaintsUseCase,
    OnchurchCreateMySaintUseCase,
    OnchurchUpdateMySaintUseCase,
    OnchurchUpdateMySaintMemoUseCase,
    OnchurchUpdateMySaintFavoriteUseCase,
    OnchurchDeleteMySaintUseCase,
    OnchurchListMySaintRelationsUseCase,
    OnchurchCreateMySaintRelationUseCase,
    OnchurchDeleteMySaintRelationUseCase,
    OnchurchListMySaintPrayersUseCase,
    OnchurchCreateMySaintPrayerUseCase,
    OnchurchDeleteMySaintPrayerUseCase,
    OnchurchListMySaintTagsUseCase,
    OnchurchCreateMySaintTagUseCase,
    OnchurchDeleteMySaintTagUseCase,
    OnchurchSetMySaintTagsUseCase,
  ],
})
export class OnchurchSaintModule {}
