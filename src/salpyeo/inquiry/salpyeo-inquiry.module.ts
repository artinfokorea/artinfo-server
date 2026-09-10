import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AwsS3Service } from '@/aws/s3/aws-s3.service';
import { SalpyeoInquiry } from '@/salpyeo/inquiry/domain/entity/salpyeo-inquiry.entity';
import { SALPYEO_INQUIRY_REPOSITORY } from '@/salpyeo/inquiry/domain/repository/salpyeo-inquiry.repository.interface';
import { SalpyeoInquiryRepository } from '@/salpyeo/inquiry/infrastructure/repository/salpyeo-inquiry.repository';
import { SalpyeoInquiryMemoryRepository } from '@/salpyeo/inquiry/infrastructure/repository/salpyeo-inquiry.memory.repository';
import {
  SalpyeoCreateInquiryUseCase,
  SalpyeoResolveInquiryUseCase,
  SalpyeoScanInquiriesUseCase,
} from '@/salpyeo/inquiry/application/usecase/salpyeo-inquiry.usecase';
import { SalpyeoInquiryController } from '@/salpyeo/inquiry/presentation/controller/salpyeo-inquiry.controller';
import { SalpyeoAdminInquiryController } from '@/salpyeo/inquiry/presentation/controller/salpyeo-admin-inquiry.controller';
import { SalpyeoAdminGuard } from '@/salpyeo/common/salpyeo-admin.guard';
import { SalpyeoUserModule } from '@/salpyeo/user/salpyeo-user.module';
import { isSalpyeoMemoryRepository } from '@/salpyeo/common/salpyeo-repository-mode';

export const SALPYEO_INQUIRY_USE_CASES = [SalpyeoCreateInquiryUseCase, SalpyeoScanInquiriesUseCase, SalpyeoResolveInquiryUseCase];
export const SALPYEO_INQUIRY_CONTROLLERS = [SalpyeoInquiryController, SalpyeoAdminInquiryController];

@Module({
  // 관리자 가드가 살펴 사용자 저장소로 role 을 확인한다
  imports: [SalpyeoUserModule, ...(isSalpyeoMemoryRepository() ? [] : [TypeOrmModule.forFeature([SalpyeoInquiry])])],
  controllers: SALPYEO_INQUIRY_CONTROLLERS,
  providers: [
    ...SALPYEO_INQUIRY_USE_CASES,
    SalpyeoAdminGuard,
    AwsS3Service,
    isSalpyeoMemoryRepository()
      ? { provide: SALPYEO_INQUIRY_REPOSITORY, useValue: new SalpyeoInquiryMemoryRepository() }
      : { provide: SALPYEO_INQUIRY_REPOSITORY, useClass: SalpyeoInquiryRepository },
  ],
})
export class SalpyeoInquiryModule {}
