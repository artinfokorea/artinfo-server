import { Module } from '@nestjs/common';
import { AzeyoUserModule } from '@/azeyo/user/azeyo-user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AzeyoSchedule } from '@/azeyo/schedule/domain/entity/azeyo-schedule.entity';
import { AzeyoScheduleTag } from '@/azeyo/schedule/domain/entity/azeyo-schedule-tag.entity';
import { AzeyoScheduleRecommendation } from '@/azeyo/schedule/domain/entity/azeyo-schedule-recommendation.entity';
import { AzeyoScheduleController } from '@/azeyo/schedule/presentation/controller/azeyo-schedule.controller';
import { AZEYO_SCHEDULE_REPOSITORY } from '@/azeyo/schedule/domain/repository/azeyo-schedule.repository.interface';
import { AZEYO_SCHEDULE_TAG_REPOSITORY } from '@/azeyo/schedule/domain/repository/azeyo-schedule-tag.repository.interface';
import { AZEYO_SCHEDULE_RECOMMENDATION_REPOSITORY } from '@/azeyo/schedule/domain/repository/azeyo-schedule-recommendation.repository.interface';
import { AzeyoScheduleRepository } from '@/azeyo/schedule/infrastructure/repository/azeyo-schedule.repository';
import { AzeyoScheduleTagRepository } from '@/azeyo/schedule/infrastructure/repository/azeyo-schedule-tag.repository';
import { AzeyoScheduleRecommendationRepository } from '@/azeyo/schedule/infrastructure/repository/azeyo-schedule-recommendation.repository';
import { AzeyoCreateScheduleUseCase } from '@/azeyo/schedule/application/usecase/azeyo-create-schedule.usecase';
import { AzeyoScanSchedulesUseCase } from '@/azeyo/schedule/application/usecase/azeyo-scan-schedules.usecase';
import { AzeyoUpdateScheduleUseCase } from '@/azeyo/schedule/application/usecase/azeyo-update-schedule.usecase';
import { AzeyoDeleteScheduleUseCase } from '@/azeyo/schedule/application/usecase/azeyo-delete-schedule.usecase';
import { AzeyoScanScheduleTagsUseCase } from '@/azeyo/schedule/application/usecase/azeyo-scan-schedule-tags.usecase';
import { AzeyoCreateScheduleTagUseCase } from '@/azeyo/schedule/application/usecase/azeyo-create-schedule-tag.usecase';
import { AzeyoScanScheduleRecommendationsUseCase } from '@/azeyo/schedule/application/usecase/azeyo-scan-schedule-recommendations.usecase';

@Module({
  imports: [TypeOrmModule.forFeature([AzeyoSchedule, AzeyoScheduleTag, AzeyoScheduleRecommendation]), AzeyoUserModule],
  controllers: [AzeyoScheduleController],
  providers: [
    // UseCases
    AzeyoCreateScheduleUseCase,
    AzeyoScanSchedulesUseCase,
    AzeyoUpdateScheduleUseCase,
    AzeyoDeleteScheduleUseCase,
    AzeyoScanScheduleTagsUseCase,
    AzeyoCreateScheduleTagUseCase,
    AzeyoScanScheduleRecommendationsUseCase,
    // Repositories
    { provide: AZEYO_SCHEDULE_REPOSITORY, useClass: AzeyoScheduleRepository },
    { provide: AZEYO_SCHEDULE_TAG_REPOSITORY, useClass: AzeyoScheduleTagRepository },
    { provide: AZEYO_SCHEDULE_RECOMMENDATION_REPOSITORY, useClass: AzeyoScheduleRecommendationRepository },
  ],
})
export class AzeyoScheduleModule {}
