import { Module } from '@nestjs/common';
import { PerformanceController } from '@/performance/performance.controller';
import { PerformanceService } from '@/performance/performance.service';
import { PerformanceRepository } from '@/performance/repository/performance.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Performance } from '@/performance/performance.entity';
import { PerformanceArea } from '@/performance/performance-area.entity';
import { PerformanceAreaRepository } from '@/performance/repository/performance-area.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Performance, PerformanceArea])],
  controllers: [PerformanceController],
  providers: [PerformanceService, PerformanceRepository, PerformanceAreaRepository],
})
export class PerformanceModule {}
