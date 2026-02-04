import { Injectable } from '@nestjs/common';
import * as Sharp from 'sharp';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { execSync } from 'child_process';
import { ConvertedImage } from '../dto/converted-image.dto';
import { FileConversionFailed } from '../exception/file-converter.exception';

@Injectable()
export class PdfConverterService {
  async convertToImages(buffer: Buffer, filename: string): Promise<ConvertedImage[]> {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pdf-convert-'));
    const pdfPath = path.join(tempDir, 'input.pdf');

    try {
      // PDF 버퍼를 임시 파일로 저장
      fs.writeFileSync(pdfPath, buffer);

      // pdftoppm으로 PDF를 이미지로 변환 (JPEG, 150 DPI)
      const outputPrefix = path.join(tempDir, 'page');
      execSync(`pdftoppm -jpeg -r 150 "${pdfPath}" "${outputPrefix}"`, {
        timeout: 60000,
      });

      // 생성된 이미지 파일들 읽기
      const files = fs.readdirSync(tempDir).filter((f) => f.endsWith('.jpg')).sort();
      const images: ConvertedImage[] = [];

      for (let i = 0; i < files.length; i++) {
        const imagePath = path.join(tempDir, files[i]);
        const imageBuffer = fs.readFileSync(imagePath);
        const metadata = await Sharp(imageBuffer).metadata();

        images.push(
          new ConvertedImage({
            buffer: imageBuffer,
            width: metadata.width || 1653,
            height: metadata.height || 2339,
            mimeType: 'image/jpeg',
            extension: 'jpeg',
            originalFilename: filename,
            pageNumber: i + 1,
          }),
        );
      }

      return images;
    } catch (error) {
      throw new FileConversionFailed(`PDF 변환 실패: ${(error as Error).message}`);
    } finally {
      // 임시 파일 정리
      try {
        fs.rmSync(tempDir, { recursive: true, force: true });
      } catch {
        // 정리 실패는 무시
      }
    }
  }
}
