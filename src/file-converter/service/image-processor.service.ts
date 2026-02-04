import { Injectable } from '@nestjs/common';
import * as Sharp from 'sharp';
import { ConvertedImage } from '../dto/converted-image.dto';
import { UploadFile } from '@/common/type/type';

@Injectable()
export class ImageProcessorService {
  async processImage(file: UploadFile): Promise<ConvertedImage> {
    const metadata = await Sharp(file.buffer).metadata();

    if (!metadata.width || !metadata.height || !metadata.format) {
      throw new Error('이미지 메타데이터를 읽을 수 없습니다.');
    }

    return new ConvertedImage({
      buffer: file.buffer,
      width: metadata.width,
      height: metadata.height,
      mimeType: file.mimetype,
      extension: metadata.format,
      originalFilename: file.originalname,
    });
  }

  generateImageHtml(imageUrl: string, width: number, height: number): string {
    return `<figure class="image"><img style="aspect-ratio:${width}/${height};" src="${imageUrl}" width="${width}" height="${height}"></figure>`;
  }

  generateMultipleImageHtml(images: { url: string; width: number; height: number }[]): string {
    return images.map(img => this.generateImageHtml(img.url, img.width, img.height)).join('');
  }
}
