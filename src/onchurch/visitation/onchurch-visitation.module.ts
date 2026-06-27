import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OnchurchVisitation } from '@/onchurch/visitation/domain/entity/onchurch-visitation.entity';
import { OnchurchVisitationType } from '@/onchurch/visitation/domain/entity/onchurch-visitation-type.entity';
import { ONCHURCH_VISITATION_REPOSITORY } from '@/onchurch/visitation/domain/repository/onchurch-visitation.repository.interface';
import { ONCHURCH_VISITATION_TYPE_REPOSITORY } from '@/onchurch/visitation/domain/repository/onchurch-visitation-type.repository.interface';
import { OnchurchVisitationRepository } from '@/onchurch/visitation/infrastructure/repository/onchurch-visitation.repository';
import { OnchurchVisitationTypeRepository } from '@/onchurch/visitation/infrastructure/repository/onchurch-visitation-type.repository';
import { OnchurchVisitationController } from '@/onchurch/visitation/presentation/controller/onchurch-visitation.controller';
import {
  OnchurchListMyVisitationsUseCase,
  OnchurchCreateMyVisitationUseCase,
  OnchurchUpdateMyVisitationUseCase,
  OnchurchDeleteMyVisitationUseCase,
} from '@/onchurch/visitation/application/usecase/onchurch-visitation.usecase';
import {
  OnchurchListMyVisitationTypesUseCase,
  OnchurchCreateMyVisitationTypeUseCase,
  OnchurchDeleteMyVisitationTypeUseCase,
} from '@/onchurch/visitation/application/usecase/onchurch-visitation-type.usecase';
import { OnchurchChurchModule } from '@/onchurch/church/onchurch-church.module';

@Module({
  imports: [TypeOrmModule.forFeature([OnchurchVisitation, OnchurchVisitationType]), OnchurchChurchModule],
  controllers: [OnchurchVisitationController],
  providers: [
    { provide: ONCHURCH_VISITATION_REPOSITORY, useClass: OnchurchVisitationRepository },
    { provide: ONCHURCH_VISITATION_TYPE_REPOSITORY, useClass: OnchurchVisitationTypeRepository },
    OnchurchListMyVisitationsUseCase,
    OnchurchCreateMyVisitationUseCase,
    OnchurchUpdateMyVisitationUseCase,
    OnchurchDeleteMyVisitationUseCase,
    OnchurchListMyVisitationTypesUseCase,
    OnchurchCreateMyVisitationTypeUseCase,
    OnchurchDeleteMyVisitationTypeUseCase,
  ],
})
export class OnchurchVisitationModule {}
