import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OnchurchWorshipService } from '@/onchurch/worship/domain/entity/onchurch-worship-service.entity';
import { OnchurchWorshipOrder } from '@/onchurch/worship/domain/entity/onchurch-worship-order.entity';
import { ONCHURCH_WORSHIP_SERVICE_REPOSITORY } from '@/onchurch/worship/domain/repository/onchurch-worship-service.repository.interface';
import { ONCHURCH_WORSHIP_ORDER_REPOSITORY } from '@/onchurch/worship/domain/repository/onchurch-worship-order.repository.interface';
import { OnchurchWorshipServiceRepository } from '@/onchurch/worship/infrastructure/repository/onchurch-worship-service.repository';
import { OnchurchWorshipOrderRepository } from '@/onchurch/worship/infrastructure/repository/onchurch-worship-order.repository';
import { OnchurchWorshipServiceController } from '@/onchurch/worship/presentation/controller/onchurch-worship-service.controller';
import { OnchurchWorshipOrderController } from '@/onchurch/worship/presentation/controller/onchurch-worship-order.controller';
import { OnchurchPublicWorshipController } from '@/onchurch/worship/presentation/controller/onchurch-public-worship.controller';
import {
  OnchurchListMyWorshipServicesUseCase,
  OnchurchCreateMyWorshipServiceUseCase,
  OnchurchUpdateMyWorshipServiceUseCase,
  OnchurchDeleteMyWorshipServiceUseCase,
} from '@/onchurch/worship/application/usecase/onchurch-worship-service.usecase';
import {
  OnchurchListMyWorshipOrdersUseCase,
  OnchurchCreateMyWorshipOrderUseCase,
  OnchurchUpdateMyWorshipOrderUseCase,
  OnchurchDeleteMyWorshipOrderUseCase,
} from '@/onchurch/worship/application/usecase/onchurch-worship-order.usecase';
import { OnchurchListPublicWorshipUseCase } from '@/onchurch/worship/application/usecase/onchurch-list-public-worship.usecase';
import { OnchurchChurchModule } from '@/onchurch/church/onchurch-church.module';
import { OnchurchAttendanceModule } from '@/onchurch/attendance/onchurch-attendance.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([OnchurchWorshipService, OnchurchWorshipOrder]),
    OnchurchChurchModule,
    OnchurchAttendanceModule,
  ],
  controllers: [OnchurchWorshipServiceController, OnchurchWorshipOrderController, OnchurchPublicWorshipController],
  providers: [
    { provide: ONCHURCH_WORSHIP_SERVICE_REPOSITORY, useClass: OnchurchWorshipServiceRepository },
    { provide: ONCHURCH_WORSHIP_ORDER_REPOSITORY, useClass: OnchurchWorshipOrderRepository },
    OnchurchListMyWorshipServicesUseCase,
    OnchurchCreateMyWorshipServiceUseCase,
    OnchurchUpdateMyWorshipServiceUseCase,
    OnchurchDeleteMyWorshipServiceUseCase,
    OnchurchListMyWorshipOrdersUseCase,
    OnchurchCreateMyWorshipOrderUseCase,
    OnchurchUpdateMyWorshipOrderUseCase,
    OnchurchDeleteMyWorshipOrderUseCase,
    OnchurchListPublicWorshipUseCase,
  ],
})
export class OnchurchWorshipModule {}
