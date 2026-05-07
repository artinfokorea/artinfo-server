import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OnchurchEvent } from '@/onchurch/event/domain/entity/onchurch-event.entity';
import { ONCHURCH_EVENT_REPOSITORY } from '@/onchurch/event/domain/repository/onchurch-event.repository.interface';
import { OnchurchEventRepository } from '@/onchurch/event/infrastructure/repository/onchurch-event.repository';
import { OnchurchEventController } from '@/onchurch/event/presentation/controller/onchurch-event.controller';
import { OnchurchPublicEventController } from '@/onchurch/event/presentation/controller/onchurch-public-event.controller';
import { OnchurchListMyEventsUseCase } from '@/onchurch/event/application/usecase/onchurch-list-my-events.usecase';
import { OnchurchCreateMyEventUseCase } from '@/onchurch/event/application/usecase/onchurch-create-my-event.usecase';
import { OnchurchUpdateMyEventUseCase } from '@/onchurch/event/application/usecase/onchurch-update-my-event.usecase';
import { OnchurchDeleteMyEventUseCase } from '@/onchurch/event/application/usecase/onchurch-delete-my-event.usecase';
import { OnchurchListPublicEventsUseCase } from '@/onchurch/event/application/usecase/onchurch-list-public-events.usecase';
import { OnchurchChurchModule } from '@/onchurch/church/onchurch-church.module';

@Module({
  imports: [TypeOrmModule.forFeature([OnchurchEvent]), OnchurchChurchModule],
  controllers: [OnchurchEventController, OnchurchPublicEventController],
  providers: [
    { provide: ONCHURCH_EVENT_REPOSITORY, useClass: OnchurchEventRepository },
    OnchurchListMyEventsUseCase,
    OnchurchCreateMyEventUseCase,
    OnchurchUpdateMyEventUseCase,
    OnchurchDeleteMyEventUseCase,
    OnchurchListPublicEventsUseCase,
  ],
})
export class OnchurchEventModule {}
