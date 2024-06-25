import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Inquiry } from '@/system/entity/inquiry.entity';
import { InquiryController } from '@/system/controller/inquiry.controller';
import { InquiryService } from '@/system/service/inquiry.service';
import { InquiryRepository } from '@/system/repository/inquiry.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Inquiry])],
  controllers: [InquiryController],
  providers: [InquiryService, InquiryRepository],
})
export class InquiryModule {}
