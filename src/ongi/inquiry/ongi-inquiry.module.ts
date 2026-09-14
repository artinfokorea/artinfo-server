import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OngiInquiry } from '@/ongi/inquiry/domain/entity/ongi-inquiry.entity';
import { ONGI_INQUIRY_REPOSITORY } from '@/ongi/inquiry/domain/repository/ongi-inquiry.repository.interface';
import { OngiInquiryRepository } from '@/ongi/inquiry/infrastructure/repository/ongi-inquiry.repository';
import { OngiInquiryController } from '@/ongi/inquiry/presentation/controller/ongi-inquiry.controller';
import { OngiCreateInquiryUseCase, OngiScanMyInquiriesUseCase } from '@/ongi/inquiry/application/usecase/ongi-inquiry.usecase';
import { OngiUserModule } from '@/ongi/user/ongi-user.module';
import { AwsSesService } from '@/aws/ses/aws-ses.service';

@Module({
  imports: [TypeOrmModule.forFeature([OngiInquiry]), OngiUserModule],
  controllers: [OngiInquiryController],
  providers: [{ provide: ONGI_INQUIRY_REPOSITORY, useClass: OngiInquiryRepository }, OngiCreateInquiryUseCase, OngiScanMyInquiriesUseCase, AwsSesService],
})
export class OngiInquiryModule {}
