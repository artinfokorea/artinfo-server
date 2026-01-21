import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Inquiry } from '@/system/entity/inquiry.entity';
import { InquiryController } from '@/system/controller/inquiry.controller';
import { InquiryService } from '@/system/service/inquiry.service';
import { InquiryRepository } from '@/system/repository/inquiry.repository';
import { Province } from '@/lesson/entity/province.entity';
import { ProvinceRepository } from '@/province/province.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Inquiry, Province])],
  controllers: [InquiryController],
  providers: [InquiryService, InquiryRepository, ProvinceRepository],
})
export class InquiryModule {}
