import { Module } from '@nestjs/common';
import { PerformanceController } from '@/performance/performance.controller';
import { PerformanceService } from '@/performance/performance.service';

@Module({
  imports: [],
  controllers: [PerformanceController],
  providers: [PerformanceService],
})
export class PerformanceModule {}
