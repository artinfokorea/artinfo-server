import { Module } from '@nestjs/common';
import { PerformanceController } from '@/performance/performance.controller';
import { PerformanceService } from '@/performance/performance.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PerformanceArea } from '@/performance/performance-area.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PerformanceArea])],
  controllers: [PerformanceController],
  providers: [PerformanceService],
})
export class PerformanceModule {}
