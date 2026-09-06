import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OngiEvent } from '@/ongi/event/domain/entity/ongi-event.entity';
import { ONGI_EVENT_REPOSITORY } from '@/ongi/event/domain/repository/ongi-event.repository.interface';
import { OngiEventRepository } from '@/ongi/event/infrastructure/repository/ongi-event.repository';
import { OngiEventController, OngiEventItemController } from '@/ongi/event/presentation/controller/ongi-event.controller';
import {
  OngiCreateEventUseCase,
  OngiDeleteEventUseCase,
  OngiScanEventsUseCase,
  OngiUpdateEventUseCase,
} from '@/ongi/event/application/usecase/ongi-event.usecase';
import { OngiEventReminderService } from '@/ongi/event/application/service/ongi-event-reminder.service';
import { OngiGroupModule } from '@/ongi/group/ongi-group.module';
import { OngiPushModule } from '@/ongi/push/ongi-push.module';

@Module({
  imports: [TypeOrmModule.forFeature([OngiEvent]), OngiGroupModule, OngiPushModule],
  controllers: [OngiEventController, OngiEventItemController],
  providers: [
    { provide: ONGI_EVENT_REPOSITORY, useClass: OngiEventRepository },
    OngiScanEventsUseCase,
    OngiCreateEventUseCase,
    OngiUpdateEventUseCase,
    OngiDeleteEventUseCase,
    OngiEventReminderService,
  ],
})
export class OngiEventModule {}
