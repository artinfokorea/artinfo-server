import { Injectable } from '@nestjs/common';
import { UploadFile } from '@/common/type/type';
import { AwsS3Service } from '@/aws/s3/aws-s3.service';
import { Util } from '@/common/util/util';
import * as moment from 'moment';
import { ConvertedImage } from '../dto/converted-image.dto';
import { PdfConverterService } from './pdf-converter.service';
import { HwpConverterService } from './hwp-converter.service';
import { ImageProcessorService } from './image-processor.service';
import { UnsupportedFileType } from '../exception/file-converter.exception';

export interface UploadedImageInfo {
  url: string;
  width: number;
  height: number;
}

@Injectable()
export class FileConverterService {
  private readonly SUPPORTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  private readonly PDF_TYPES = ['application/pdf'];
  private readonly HWP_EXTENSIONS = ['.hwp', '.hwpx'];

  constructor(
    private readonly awsS3Service: AwsS3Service,
    private readonly pdfConverterService: PdfConverterService,
    private readonly hwpConverterService: HwpConverterService,
    private readonly imageProcessorService: ImageProcessorService,
  ) {}

  async convertAndUploadFiles(userId: number, files: UploadFile[]): Promise<UploadedImageInfo[]> {
    const allImages: UploadedImageInfo[] = [];

    for (const file of files) {
      const convertedImages = await this.convertFile(file);

      for (const image of convertedImages) {
        const uploadResult = await this.uploadImage(userId, image);
        allImages.push(uploadResult);
      }
    }

    return allImages;
  }

  private async convertFile(file: UploadFile): Promise<ConvertedImage[]> {
    const fileExtension = this.getFileExtension(file.originalname).toLowerCase();

    if (this.HWP_EXTENSIONS.includes(fileExtension)) {
      return this.hwpConverterService.convertToImages(file.buffer, file.originalname);
    }

    if (this.PDF_TYPES.includes(file.mimetype) || fileExtension === '.pdf') {
      return this.pdfConverterService.convertToImages(file.buffer, file.originalname);
    }

    if (this.SUPPORTED_IMAGE_TYPES.includes(file.mimetype)) {
      const image = await this.imageProcessorService.processImage(file);
      return [image];
    }

    throw new UnsupportedFileType();
  }

  private async uploadImage(userId: number, image: ConvertedImage): Promise<UploadedImageInfo> {
    const util = new Util();
    const groupPath = ['upload', userId, 'jobs', moment().format('YYYYMMDD')].join('/');
    const filename = `${util.generateRandomString(11)}.${Date.now()}.${image.extension}`;
    const path = [groupPath, 'original', filename].join('/');

    const result = await this.awsS3Service.uploadStream(image.buffer, image.mimeType, path);

    return {
      url: result!.location,
      width: image.width,
      height: image.height,
    };
  }

  generateContentsHtml(existingContents: string, images: UploadedImageInfo[]): string {
    if (images.length === 0) return existingContents;

    const imagesHtml = this.imageProcessorService.generateMultipleImageHtml(images);

    if (!existingContents || existingContents.trim() === '') {
      return imagesHtml;
    }

    return `${existingContents}${imagesHtml}`;
  }

  private getFileExtension(filename: string): string {
    const lastDot = filename.lastIndexOf('.');
    return lastDot !== -1 ? filename.substring(lastDot) : '';
  }
}
