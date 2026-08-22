import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OngiPhoto } from '@/ongi/photo/domain/entity/ongi-photo.entity';
import { OngiPhotoLike } from '@/ongi/photo/domain/entity/ongi-photo-like.entity';
import { OngiPhotoComment } from '@/ongi/photo/domain/entity/ongi-photo-comment.entity';
import { ONGI_PHOTO_REPOSITORY } from '@/ongi/photo/domain/repository/ongi-photo.repository.interface';
import { OngiPhotoRepository } from '@/ongi/photo/infrastructure/repository/ongi-photo.repository';
import { OngiPhotoController } from '@/ongi/photo/presentation/controller/ongi-photo.controller';
import {
  OngiAddCommentUseCase,
  OngiGetPhotoUseCase,
  OngiPhotoAccessService,
  OngiScanAlbumPhotosUseCase,
  OngiScanCommentsUseCase,
  OngiScanFeedUseCase,
  OngiScanPersonPhotosUseCase,
  OngiScanUnfiledPhotosUseCase,
  OngiToggleLikeUseCase,
  OngiUploadPhotoFilesUseCase,
  OngiUploadPhotosUseCase,
} from '@/ongi/photo/application/usecase/ongi-photo.usecase';
import { AwsS3Service } from '@/aws/s3/aws-s3.service';
import { OngiGroupModule } from '@/ongi/group/ongi-group.module';
import { OngiAlbumModule } from '@/ongi/album/ongi-album.module';
import { OngiPersonModule } from '@/ongi/person/ongi-person.module';

import { OngiNotificationModule } from '@/ongi/notification/ongi-notification.module';

@Module({
  imports: [TypeOrmModule.forFeature([OngiPhoto, OngiPhotoLike, OngiPhotoComment]), OngiGroupModule, OngiAlbumModule, OngiPersonModule, OngiNotificationModule],
  controllers: [OngiPhotoController],
  providers: [
    { provide: ONGI_PHOTO_REPOSITORY, useClass: OngiPhotoRepository },
    OngiPhotoAccessService,
    OngiScanFeedUseCase,
    OngiScanAlbumPhotosUseCase,
    OngiScanPersonPhotosUseCase,
    OngiScanUnfiledPhotosUseCase,
    OngiGetPhotoUseCase,
    OngiToggleLikeUseCase,
    OngiScanCommentsUseCase,
    OngiAddCommentUseCase,
    OngiUploadPhotosUseCase,
    OngiUploadPhotoFilesUseCase,
    AwsS3Service,
  ],
})
export class OngiPhotoModule {}
