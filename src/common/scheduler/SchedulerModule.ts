import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { PerformanceService } from '@/performance/performance.service';
import { ArtinfoScheduler } from '@/common/scheduler/ArtinfoScheduler';
import { PerformanceRepository } from '@/performance/repository/performance.repository';
import { PerformanceAreaRepository } from '@/performance/repository/performance-area.repository';
import { UserRepository } from '@/user/repository/user.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PerformanceArea } from '@/performance/performance-area.entity';
import { User } from '@/user/entity/user.entity';
@Module({
  imports: [ScheduleModule.forRoot(), TypeOrmModule.forFeature([PerformanceArea, User])],
  providers: [ArtinfoScheduler, PerformanceService, PerformanceRepository, PerformanceAreaRepository, UserRepository],
  exports: [],
})
export class SchedulerModule {}
