import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Advertisement } from '@/system/entity/advertisement.entity';
import { AdvertisementService } from '@/system/service/advertisement.service';
import { AdvertisementRepository } from '@/system/repository/advertisement.repository';
import { AdvertisementController } from '@/system/controller/advertisement.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Advertisement])],
  controllers: [AdvertisementController],
  providers: [AdvertisementService, AdvertisementRepository],
})
export class AdvertisementModule {}
