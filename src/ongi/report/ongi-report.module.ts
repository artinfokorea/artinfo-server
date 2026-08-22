import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OngiReport } from '@/ongi/report/domain/entity/ongi-report.entity';
import { ONGI_REPORT_REPOSITORY } from '@/ongi/report/domain/repository/ongi-report.repository.interface';
import { OngiReportRepository } from '@/ongi/report/infrastructure/repository/ongi-report.repository';
import { OngiReportController } from '@/ongi/report/presentation/controller/ongi-report.controller';
import { OngiCreateReportUseCase } from '@/ongi/report/application/usecase/ongi-report.usecase';
import { OngiGroupModule } from '@/ongi/group/ongi-group.module';
import { OngiPhotoModule } from '@/ongi/photo/ongi-photo.module';

@Module({
  imports: [TypeOrmModule.forFeature([OngiReport]), OngiGroupModule, OngiPhotoModule],
  controllers: [OngiReportController],
  providers: [{ provide: ONGI_REPORT_REPOSITORY, useClass: OngiReportRepository }, OngiCreateReportUseCase],
})
export class OngiReportModule {}
