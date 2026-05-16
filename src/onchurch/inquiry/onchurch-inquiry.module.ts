import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OnchurchInquiry } from '@/onchurch/inquiry/domain/entity/onchurch-inquiry.entity';
import { ONCHURCH_INQUIRY_REPOSITORY } from '@/onchurch/inquiry/domain/repository/onchurch-inquiry.repository.interface';
import { OnchurchInquiryRepository } from '@/onchurch/inquiry/infrastructure/repository/onchurch-inquiry.repository';
import {
  OnchurchCreateMyInquiryUseCase,
  OnchurchListMyInquiriesUseCase,
} from '@/onchurch/inquiry/application/usecase/onchurch-inquiry.usecase';
import { OnchurchInquiryController } from '@/onchurch/inquiry/presentation/controller/onchurch-inquiry.controller';
import { OnchurchUserModule } from '@/onchurch/user/onchurch-user.module';
import { AwsSesService } from '@/aws/ses/aws-ses.service';

@Module({
  imports: [TypeOrmModule.forFeature([OnchurchInquiry]), OnchurchUserModule],
  controllers: [OnchurchInquiryController],
  providers: [
    { provide: ONCHURCH_INQUIRY_REPOSITORY, useClass: OnchurchInquiryRepository },
    OnchurchCreateMyInquiryUseCase,
    OnchurchListMyInquiriesUseCase,
    AwsSesService,
  ],
})
export class OnchurchInquiryModule {}
