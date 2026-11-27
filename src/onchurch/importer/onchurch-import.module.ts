import { Module } from '@nestjs/common';
import { OnchurchUserModule } from '@/onchurch/user/onchurch-user.module';
import { AwsS3Service } from '@/aws/s3/aws-s3.service';
import { OnchurchImportController } from '@/onchurch/importer/onchurch-import.controller';
import { OnchurchWordpressImportUseCase } from '@/onchurch/importer/onchurch-wordpress-import.usecase';
import { OnchurchImportRepository } from '@/onchurch/importer/onchurch-import.repository';
import { WordpressSource } from '@/onchurch/importer/wordpress-source';
import { ImportImageCopier } from '@/onchurch/importer/import-image-copier';
import { OnchurchBrokenSermonUseCase } from '@/onchurch/importer/onchurch-broken-sermon.usecase';
import { YoutubeAvailability } from '@/onchurch/importer/youtube-availability';

@Module({
  imports: [OnchurchUserModule],
  controllers: [OnchurchImportController],
  providers: [
    OnchurchWordpressImportUseCase,
    OnchurchBrokenSermonUseCase,
    YoutubeAvailability,
    OnchurchImportRepository,
    WordpressSource,
    ImportImageCopier,
    AwsS3Service,
  ],
})
export class OnchurchImportModule {}
