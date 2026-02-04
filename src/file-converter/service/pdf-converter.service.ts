import { Injectable } from '@nestjs/common';
import { fromBuffer } from 'pdf2pic';
import * as Sharp from 'sharp';
import { ConvertedImage } from '../dto/converted-image.dto';
import { FileConversionFailed } from '../exception/file-converter.exception';

@Injectable()
export class PdfConverterService {
  async convertToImages(buffer: Buffer, filename: string): Promise<ConvertedImage[]> {
    try {
      const options = {
        density: 150,
        format: 'jpeg',
        width: 1653,
        height: 2339,
      };

      const converter = fromBuffer(buffer, options);
      const pageCount = this.getPageCount(buffer);
      const images: ConvertedImage[] = [];

      for (let page = 1; page <= pageCount; page++) {
        const result = await converter(page, { responseType: 'buffer' });
        const imageBuffer = result.buffer as Buffer;
        const metadata = await Sharp(imageBuffer).metadata();

        images.push(
          new ConvertedImage({
            buffer: imageBuffer,
            width: metadata.width || 1653,
            height: metadata.height || 2339,
            mimeType: 'image/jpeg',
            extension: 'jpeg',
            originalFilename: filename,
            pageNumber: page,
          }),
        );
      }

      return images;
    } catch (error) {
      throw new FileConversionFailed(`PDF 변환 실패: ${(error as Error).message}`);
    }
  }

  private getPageCount(buffer: Buffer): number {
    const pdfStr = buffer.toString('utf8', 0, Math.min(buffer.length, 100000));
    const match = pdfStr.match(/\/Count\s+(\d+)/);
    return match ? parseInt(match[1], 10) : 1;
  }
}
