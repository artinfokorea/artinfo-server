import { Module } from '@nestjs/common';
import { AwsS3Service } from '@/aws/s3/aws-s3.service';
import { ONGI_ADMIN_REPOSITORY } from '@/ongi/admin/domain/repository/ongi-admin.repository.interface';
import { OngiAdminRepository } from '@/ongi/admin/infrastructure/repository/ongi-admin.repository';
import { OngiAdminController } from '@/ongi/admin/presentation/controller/ongi-admin.controller';
import { OngiAdminGuard } from '@/ongi/admin/presentation/guard/ongi-admin.guard';
import {
  OngiAdminConfigUseCase,
  OngiAdminDashboardUseCase,
  OngiAdminDirectoryUseCase,
  OngiAdminMeUseCase,
  OngiAdminReportUseCase,
} from '@/ongi/admin/application/usecase/ongi-admin.usecase';
import { OngiPhotoModule } from '@/ongi/photo/ongi-photo.module';
import { OngiConfigModule } from '@/ongi/config/ongi-config.module';

@Module({
  imports: [OngiPhotoModule, OngiConfigModule],
  controllers: [OngiAdminController],
  providers: [
    { provide: ONGI_ADMIN_REPOSITORY, useClass: OngiAdminRepository },
    OngiAdminGuard,
    OngiAdminMeUseCase,
    OngiAdminDashboardUseCase,
    OngiAdminReportUseCase,
    OngiAdminDirectoryUseCase,
    OngiAdminConfigUseCase,
    AwsS3Service,
  ],
})
export class OngiAdminModule {}
