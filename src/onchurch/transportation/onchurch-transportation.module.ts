import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OnchurchTransportation } from '@/onchurch/transportation/domain/entity/onchurch-transportation.entity';
import { ONCHURCH_TRANSPORTATION_REPOSITORY } from '@/onchurch/transportation/domain/repository/onchurch-transportation.repository.interface';
import { OnchurchTransportationRepository } from '@/onchurch/transportation/infrastructure/repository/onchurch-transportation.repository';
import { OnchurchTransportationController } from '@/onchurch/transportation/presentation/controller/onchurch-transportation.controller';
import { OnchurchPublicTransportationController } from '@/onchurch/transportation/presentation/controller/onchurch-public-transportation.controller';
import { OnchurchListMyTransportationsUseCase } from '@/onchurch/transportation/application/usecase/onchurch-list-my-transportations.usecase';
import { OnchurchCreateMyTransportationUseCase } from '@/onchurch/transportation/application/usecase/onchurch-create-my-transportation.usecase';
import { OnchurchUpdateMyTransportationUseCase } from '@/onchurch/transportation/application/usecase/onchurch-update-my-transportation.usecase';
import { OnchurchDeleteMyTransportationUseCase } from '@/onchurch/transportation/application/usecase/onchurch-delete-my-transportation.usecase';
import { OnchurchListPublicTransportationsUseCase } from '@/onchurch/transportation/application/usecase/onchurch-list-public-transportations.usecase';
import { OnchurchChurchModule } from '@/onchurch/church/onchurch-church.module';

@Module({
  imports: [TypeOrmModule.forFeature([OnchurchTransportation]), OnchurchChurchModule],
  controllers: [OnchurchTransportationController, OnchurchPublicTransportationController],
  providers: [
    { provide: ONCHURCH_TRANSPORTATION_REPOSITORY, useClass: OnchurchTransportationRepository },
    OnchurchListMyTransportationsUseCase,
    OnchurchCreateMyTransportationUseCase,
    OnchurchUpdateMyTransportationUseCase,
    OnchurchDeleteMyTransportationUseCase,
    OnchurchListPublicTransportationsUseCase,
  ],
})
export class OnchurchTransportationModule {}
