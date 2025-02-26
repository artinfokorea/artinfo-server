import { Module } from '@nestjs/common';
import { SystemController } from '@/system/controller/system.controller';
import { SystemService } from '@/system/service/system.service';
import { AwsS3Service } from '@/aws/s3/aws-s3.service';
import { ImageRepository } from '@/system/repository/image.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImageEntity } from '@/system/entity/image.entity';
import { Province } from '@/lesson/entity/province.entity';
import { ProvinceRepository } from '@/province/province.repository';
import { RedisRepository } from '@/common/redis/redis-repository.service';

@Module({
  imports: [TypeOrmModule.forFeature([ImageEntity, Province])],
  controllers: [SystemController],
  providers: [SystemService, AwsS3Service, ImageRepository, ProvinceRepository, RedisRepository],
})
export class SystemModule {}
