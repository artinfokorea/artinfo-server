import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OnchurchAttendance } from '@/onchurch/attendance/domain/entity/onchurch-attendance.entity';
import { ONCHURCH_ATTENDANCE_REPOSITORY } from '@/onchurch/attendance/domain/repository/onchurch-attendance.repository.interface';
import { OnchurchAttendanceRepository } from '@/onchurch/attendance/infrastructure/repository/onchurch-attendance.repository';
import { OnchurchAttendanceController } from '@/onchurch/attendance/presentation/controller/onchurch-attendance.controller';
import {
  OnchurchGetAttendanceSessionUseCase,
  OnchurchMarkAttendanceUseCase,
  OnchurchListAttendanceSessionsUseCase,
  OnchurchGetAttendanceStatsUseCase,
} from '@/onchurch/attendance/application/usecase/onchurch-attendance.usecase';
import { OnchurchChurchModule } from '@/onchurch/church/onchurch-church.module';

@Module({
  imports: [TypeOrmModule.forFeature([OnchurchAttendance]), OnchurchChurchModule],
  controllers: [OnchurchAttendanceController],
  providers: [
    { provide: ONCHURCH_ATTENDANCE_REPOSITORY, useClass: OnchurchAttendanceRepository },
    OnchurchGetAttendanceSessionUseCase,
    OnchurchMarkAttendanceUseCase,
    OnchurchListAttendanceSessionsUseCase,
    OnchurchGetAttendanceStatsUseCase,
  ],
  exports: [ONCHURCH_ATTENDANCE_REPOSITORY],
})
export class OnchurchAttendanceModule {}
