import { Module } from '@nestjs/common';
import { FileConverterService } from './service/file-converter.service';
import { PdfConverterService } from './service/pdf-converter.service';
import { ImageProcessorService } from './service/image-processor.service';
import { AwsS3Service } from '@/aws/s3/aws-s3.service';

@Module({
  providers: [FileConverterService, PdfConverterService, ImageProcessorService, AwsS3Service],
  exports: [FileConverterService],
})
export class FileConverterModule {}
