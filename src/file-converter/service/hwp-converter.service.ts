import { Injectable } from '@nestjs/common';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';
import { ConvertedImage } from '../dto/converted-image.dto';
import { FileConversionFailed } from '../exception/file-converter.exception';
import { PdfConverterService } from './pdf-converter.service';
import { Util } from '@/common/util/util';

const execAsync = promisify(exec);

@Injectable()
export class HwpConverterService {
  constructor(private readonly pdfConverterService: PdfConverterService) {}

  async convertToImages(buffer: Buffer, filename: string): Promise<ConvertedImage[]> {
    const tempDir = path.join(os.tmpdir(), new Util().generateRandomString(16));
    const ext = path.extname(filename) || '.hwp';
    const inputPath = path.join(tempDir, `input${ext}`);

    try {
      await fs.mkdir(tempDir, { recursive: true });
      await fs.writeFile(inputPath, buffer);

      const { stdout, stderr } = await execAsync(`libreoffice --headless --convert-to pdf --outdir "${tempDir}" "${inputPath}"`, { timeout: 60000 });

      const files = await fs.readdir(tempDir);
      const pdfFile = files.find(f => f.endsWith('.pdf'));

      if (!pdfFile) {
        console.error('LibreOffice 변환 실패:', { stdout, stderr, files, tempDir, inputPath });
        throw new FileConversionFailed('HWP를 PDF로 변환하지 못했습니다.');
      }

      const pdfPath = path.join(tempDir, pdfFile);
      const pdfBuffer = await fs.readFile(pdfPath);

      return await this.pdfConverterService.convertToImages(pdfBuffer, filename);
    } catch (error) {
      if (error instanceof FileConversionFailed) throw error;
      throw new FileConversionFailed(`HWP 변환 실패: ${(error as Error).message}`);
    } finally {
      await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});
    }
  }
}
