import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OnchurchSaint } from '@/onchurch/saint/domain/entity/onchurch-saint.entity';
import { OnchurchSaintRelation } from '@/onchurch/saint/domain/entity/onchurch-saint-relation.entity';
import { ONCHURCH_SAINT_REPOSITORY } from '@/onchurch/saint/domain/repository/onchurch-saint.repository.interface';
import { ONCHURCH_SAINT_RELATION_REPOSITORY } from '@/onchurch/saint/domain/repository/onchurch-saint-relation.repository.interface';
import { OnchurchSaintRepository } from '@/onchurch/saint/infrastructure/repository/onchurch-saint.repository';
import { OnchurchSaintRelationRepository } from '@/onchurch/saint/infrastructure/repository/onchurch-saint-relation.repository';
import { OnchurchSaintController } from '@/onchurch/saint/presentation/controller/onchurch-saint.controller';
import {
  OnchurchListMySaintsUseCase,
  OnchurchCreateMySaintUseCase,
  OnchurchUpdateMySaintUseCase,
  OnchurchDeleteMySaintUseCase,
} from '@/onchurch/saint/application/usecase/onchurch-saint.usecase';
import {
  OnchurchListMySaintRelationsUseCase,
  OnchurchCreateMySaintRelationUseCase,
  OnchurchDeleteMySaintRelationUseCase,
} from '@/onchurch/saint/application/usecase/onchurch-saint-relation.usecase';
import { OnchurchChurchModule } from '@/onchurch/church/onchurch-church.module';

@Module({
  imports: [TypeOrmModule.forFeature([OnchurchSaint, OnchurchSaintRelation]), OnchurchChurchModule],
  controllers: [OnchurchSaintController],
  providers: [
    { provide: ONCHURCH_SAINT_REPOSITORY, useClass: OnchurchSaintRepository },
    { provide: ONCHURCH_SAINT_RELATION_REPOSITORY, useClass: OnchurchSaintRelationRepository },
    OnchurchListMySaintsUseCase,
    OnchurchCreateMySaintUseCase,
    OnchurchUpdateMySaintUseCase,
    OnchurchDeleteMySaintUseCase,
    OnchurchListMySaintRelationsUseCase,
    OnchurchCreateMySaintRelationUseCase,
    OnchurchDeleteMySaintRelationUseCase,
  ],
})
export class OnchurchSaintModule {}
