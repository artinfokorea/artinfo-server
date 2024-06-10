import { Module } from '@nestjs/common';
import { SystemController } from '@/system/controller/system.controller';
import { SystemService } from '@/system/service/system.service';
import { AwsS3Service } from '@/aws/s3/aws-s3.service';
import { ImageRepository } from '@/system/repository/image.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Image } from '@/system/entity/image.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Image])],
  controllers: [SystemController],
  providers: [SystemService, AwsS3Service, ImageRepository],
})
export class SystemModule {}
