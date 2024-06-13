import { Module } from '@nestjs/common';
import { ProvinceController } from '@/province/province.controller';
import { ProvinceService } from '@/province/province.service';
import { ProvinceRepository } from '@/province/province.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Province } from '@/lesson/entity/province.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Province])],
  controllers: [ProvinceController],
  providers: [ProvinceService, ProvinceRepository],
})
export class ProvinceModule {}
