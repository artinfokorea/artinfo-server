import { Module } from '@nestjs/common';
import { PerformanceController } from '@/performance/performance.controller';
import { PerformanceService } from '@/performance/performance.service';
import { PerformanceRepository } from '@/performance/repository/performance.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Performance } from '@/performance/performance.entity';
import { PerformanceArea } from '@/performance/performance-area.entity';
import { PerformanceAreaRepository } from '@/performance/repository/performance-area.repository';
import { UserRepository } from '@/user/repository/user.repository';
import { User } from '@/user/entity/user.entity';
import { PerformanceAreaService } from '@/performance/performance-area.service';

@Module({
  imports: [TypeOrmModule.forFeature([Performance, PerformanceArea, User])],
  controllers: [PerformanceController],
  providers: [PerformanceService, PerformanceAreaService, PerformanceRepository, PerformanceAreaRepository, UserRepository],
})
export class PerformanceModule {}
