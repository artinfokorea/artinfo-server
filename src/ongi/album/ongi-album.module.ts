import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OngiAlbum } from '@/ongi/album/domain/entity/ongi-album.entity';
import { ONGI_ALBUM_REPOSITORY } from '@/ongi/album/domain/repository/ongi-album.repository.interface';
import { OngiAlbumRepository } from '@/ongi/album/infrastructure/repository/ongi-album.repository';
import { OngiAlbumController } from '@/ongi/album/presentation/controller/ongi-album.controller';
import { OngiCreateAlbumUseCase, OngiScanAlbumsUseCase } from '@/ongi/album/application/usecase/ongi-album.usecase';
import { OngiGroupModule } from '@/ongi/group/ongi-group.module';

@Module({
  imports: [TypeOrmModule.forFeature([OngiAlbum]), OngiGroupModule],
  controllers: [OngiAlbumController],
  providers: [{ provide: ONGI_ALBUM_REPOSITORY, useClass: OngiAlbumRepository }, OngiScanAlbumsUseCase, OngiCreateAlbumUseCase],
  exports: [ONGI_ALBUM_REPOSITORY],
})
export class OngiAlbumModule {}
