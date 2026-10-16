import { HttpException, Inject, Injectable, Optional } from '@nestjs/common';
import { randomUUID } from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import { HWP_CONVERTER_DRIVER, HWP_CONVERTER_ENV, HWP_EXTENSIONS, hwpConverterConfig } from '../hwp-converter.config';
import { HwpConversionFailed, HwpConverterUnavailable, HwpUnsupportedFile } from '../exception/hwp-converter.exception';
import { naturalCompare } from '../util/natural-compare';
import { readPngSize } from '../util/png-size';
import { SerialQueue } from '../util/serial-queue';
import { HwpConverterDriver, PolarisDriver } from './polaris-driver';
import { checkAccessibility } from './osascript';

export interface HwpPngPage {
  page: number;
  fileName: string;
  width: number;
  height: number;
  bytes: number;
  data: Buffer;
}

export interface HwpPngResult {
  jobId: string;
  originalName: string;
  pageCount: number;
  pages: HwpPngPage[];
  steps: string[];
  elapsedMs: number;
}

export interface HwpConverterDoctor {
  ok: boolean;
  platform: string;
  polarisInstalled: boolean;
  axclickBuilt: boolean;
  accessibility: { ok: boolean; detail: string };
  workDir: string;
  queued: number;
}

export interface HwpConverterEnv {
  platform: NodeJS.Platform;
  workDir: string;
  cleanup: boolean;
}

/**
 * HWP/HWPX → PNG 변환. macOS 에 설치된 Polaris Office 를 GUI 자동화로 구동한다.
 * 요청은 직렬 큐로 한 번에 하나씩 처리한다 (Polaris 는 단일 인스턴스 GUI 앱).
 */
@Injectable()
export class PolarisHwpConverterService {
  private readonly queue = new SerialQueue();
  private readonly driver: HwpConverterDriver;
  private readonly env: HwpConverterEnv;

  constructor(@Optional() @Inject(HWP_CONVERTER_DRIVER) driver?: HwpConverterDriver, @Optional() @Inject(HWP_CONVERTER_ENV) env?: Partial<HwpConverterEnv>) {
    this.driver = driver ?? new PolarisDriver();
    this.env = {
      platform: env?.platform ?? process.platform,
      workDir: env?.workDir ?? hwpConverterConfig.workDir,
      cleanup: env?.cleanup ?? hwpConverterConfig.cleanup,
    };
  }

  get queued(): number {
    return this.queue.size;
  }

  async convertToPng(buffer: Buffer, originalName: string): Promise<HwpPngResult> {
    const ext = path.extname(originalName).toLowerCase();
    if (!HWP_EXTENSIONS.has(ext)) {
      throw new HwpUnsupportedFile(`지원하지 않는 확장자입니다: ${ext || '(없음)'} — ${[...HWP_EXTENSIONS].join(', ')} 만 가능`);
    }
    if (buffer.length === 0) throw new HwpUnsupportedFile('빈 파일입니다.');
    if (this.env.platform !== 'darwin') {
      throw new HwpConverterUnavailable('HWP → PNG 변환은 Polaris Office 가 설치된 macOS 에서만 동작합니다.');
    }
    return this.queue.run(() => this.convertExclusive(buffer, originalName, ext));
  }

  async doctor(): Promise<HwpConverterDoctor> {
    const polarisInstalled = fs.existsSync(hwpConverterConfig.polarisAppPath);
    const axclickBuilt = fs.existsSync(hwpConverterConfig.axclickPath);
    const accessibility = this.env.platform === 'darwin' ? await checkAccessibility() : { ok: false, detail: 'macOS 아님' };
    return {
      ok: this.env.platform === 'darwin' && polarisInstalled && axclickBuilt && accessibility.ok,
      platform: this.env.platform,
      polarisInstalled,
      axclickBuilt,
      accessibility,
      workDir: this.env.workDir,
      queued: this.queue.size,
    };
  }

  dumpUi(depth: number): Promise<string> {
    return this.driver.dumpUi(depth);
  }

  private async convertExclusive(buffer: Buffer, originalName: string, ext: string): Promise<HwpPngResult> {
    const started = Date.now();
    const jobId = randomUUID().replace(/-/g, '').slice(0, 12);
    const jobDir = path.join(this.env.workDir, jobId);
    fs.mkdirSync(jobDir, { recursive: true });

    // 창 식별·출력 폴더명에 쓰기 위해 입력 파일명을 jobId 로 바꾼다 (한글·공백 파일명 이슈 회피)
    const docName = `po${jobId}`;
    const inputPath = path.join(jobDir, `${docName}${ext}`);
    fs.writeFileSync(inputPath, buffer);
    // Polaris 는 문서 폴더(jobDir)에 <입력한 이름>.png 폴더를 만들고 <문서명>_0001.png … 를 쓴다
    const outName = `${docName}_png`;

    const steps: string[] = [];
    let opened = false;
    try {
      const dismissed = await this.driver.openDocument(inputPath, docName);
      opened = true;
      steps.push('document_opened', ...dismissed.map(t => `dialog_dismissed(${t})`));
      const log = await this.driver.exportPng(outName);
      steps.push(...log.steps);
      const files = await this.driver.waitForPngs(jobDir, hwpConverterConfig.exportTimeoutMs);
      const pages = this.readPages(files);
      return { jobId, originalName, pageCount: pages.length, pages, steps, elapsedMs: Date.now() - started };
    } catch (e) {
      if (e instanceof HttpException) {
        const body = e.getResponse();
        if (body && typeof body === 'object') {
          const detail = body['detail'];
          if (detail && typeof detail === 'object' && !Array.isArray(detail)) detail['steps'] = steps;
        }
        throw e;
      }
      throw new HwpConversionFailed((e as Error).message, { steps });
    } finally {
      if (opened) await this.driver.closeDocument();
      if (this.env.cleanup) {
        fs.rmSync(jobDir, { recursive: true, force: true });
      }
    }
  }

  private readPages(files: string[]): HwpPngPage[] {
    const sorted = [...files].sort((a, b) => naturalCompare(path.basename(a), path.basename(b)));
    return sorted.map((file, i) => {
      const data = fs.readFileSync(file);
      const { width, height } = readPngSize(data);
      return { page: i + 1, fileName: path.basename(file), width, height, bytes: data.length, data };
    });
  }
}
