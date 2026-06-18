import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OnchurchSermon } from '@/onchurch/sermon/domain/entity/onchurch-sermon.entity';
import { OnchurchSermonSeries } from '@/onchurch/sermon/domain/entity/onchurch-sermon-series.entity';
import { ONCHURCH_SERMON_REPOSITORY } from '@/onchurch/sermon/domain/repository/onchurch-sermon.repository.interface';
import { ONCHURCH_SERMON_SERIES_REPOSITORY } from '@/onchurch/sermon/domain/repository/onchurch-sermon-series.repository.interface';
import { OnchurchSermonRepository } from '@/onchurch/sermon/infrastructure/repository/onchurch-sermon.repository';
import { OnchurchSermonSeriesRepository } from '@/onchurch/sermon/infrastructure/repository/onchurch-sermon-series.repository';
import { OnchurchSermonController } from '@/onchurch/sermon/presentation/controller/onchurch-sermon.controller';
import { OnchurchSermonSeriesController } from '@/onchurch/sermon/presentation/controller/onchurch-sermon-series.controller';
import { OnchurchPublicSermonController } from '@/onchurch/sermon/presentation/controller/onchurch-public-sermon.controller';
import {
  OnchurchListMySermonsUseCase,
  OnchurchCreateMySermonUseCase,
  OnchurchUpdateMySermonUseCase,
  OnchurchDeleteMySermonUseCase,
} from '@/onchurch/sermon/application/usecase/onchurch-sermon.usecase';
import {
  OnchurchListMySermonSeriesUseCase,
  OnchurchCreateMySermonSeriesUseCase,
  OnchurchUpdateMySermonSeriesUseCase,
  OnchurchDeleteMySermonSeriesUseCase,
  OnchurchRestoreMySermonAllSeriesUseCase,
} from '@/onchurch/sermon/application/usecase/onchurch-sermon-series.usecase';
import { OnchurchListPublicSermonsUseCase } from '@/onchurch/sermon/application/usecase/onchurch-list-public-sermons.usecase';
import { OnchurchChurchModule } from '@/onchurch/church/onchurch-church.module';

@Module({
  imports: [TypeOrmModule.forFeature([OnchurchSermon, OnchurchSermonSeries]), OnchurchChurchModule],
  controllers: [OnchurchSermonController, OnchurchSermonSeriesController, OnchurchPublicSermonController],
  providers: [
    { provide: ONCHURCH_SERMON_REPOSITORY, useClass: OnchurchSermonRepository },
    { provide: ONCHURCH_SERMON_SERIES_REPOSITORY, useClass: OnchurchSermonSeriesRepository },
    OnchurchListMySermonsUseCase,
    OnchurchCreateMySermonUseCase,
    OnchurchUpdateMySermonUseCase,
    OnchurchDeleteMySermonUseCase,
    OnchurchListMySermonSeriesUseCase,
    OnchurchCreateMySermonSeriesUseCase,
    OnchurchUpdateMySermonSeriesUseCase,
    OnchurchDeleteMySermonSeriesUseCase,
    OnchurchRestoreMySermonAllSeriesUseCase,
    OnchurchListPublicSermonsUseCase,
  ],
})
export class OnchurchSermonModule {}
