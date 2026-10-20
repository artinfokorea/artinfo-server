import { Inject, Injectable, Optional } from '@nestjs/common';
import { execFile } from 'child_process';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as Sharp from 'sharp';
import { promisify } from 'util';
import { DOC_CONVERTER_EXEC, DOC_CONVERTER_PDF_CONFIG, documentConverterConfig } from '../document-converter.config';
import { DocumentConversionTimeout, DocumentConverterUnavailable, DocumentParseFailed, DocumentTooManyPages } from '../exception/document-converter.exception';
import { mapLimit } from '../util/map-limit';
import { naturalCompare } from '../util/natural-compare';
import { WebpConvertOptions, WebpPage, WebpPages } from './webp-types';

export type ExecFn = (file: string, args: string[], options: { timeout: number }) => Promise<{ stdout: string; stderr: string }>;

export interface PdfWebpConfig {
  maxPages: number;
  encodeConcurrency: number;
  pdftoppmPath: string;
  pdfinfoPath: string;
  pdfTimeoutMs: number;
}

export interface PdfRendererDoctor {
  ok: boolean;
  pdftoppm: string;
  pdfinfo: string;
  version?: string;
  error?: string;
}

/** PDF 포인트는 72dpi, 96 × scale 로 찍으면 HWP 경로와 같은 픽셀 크기가 된다 (A4 scale 2 ≈ 1588px). */
const PDF_BASE_DPI = 96;

const defaultExec: ExecFn = async (file, args, options) => {
  const { stdout, stderr } = await promisify(execFile)(file, args, { ...options, maxBuffer: 16 * 1024 * 1024, windowsHide: true });
  return { stdout: String(stdout), stderr: String(stderr) };
};

/**
 * PDF → WebP. poppler 의 pdftoppm 으로 페이지를 PNG 로 찍고 sharp 로 WebP 인코딩한다.
 * Dockerfile 에 poppler-utils 가 들어 있다. 로컬은 `brew install poppler`.
 */
@Injectable()
export class PdfWebpConverterService {
  private readonly exec: ExecFn;
  private readonly config: PdfWebpConfig;

  constructor(@Optional() @Inject(DOC_CONVERTER_EXEC) exec?: ExecFn, @Optional() @Inject(DOC_CONVERTER_PDF_CONFIG) config?: Partial<PdfWebpConfig>) {
    this.exec = exec ?? defaultExec;
    this.config = {
      maxPages: config?.maxPages ?? documentConverterConfig.maxPages,
      encodeConcurrency: config?.encodeConcurrency ?? documentConverterConfig.encodeConcurrency,
      pdftoppmPath: config?.pdftoppmPath ?? documentConverterConfig.pdftoppmPath,
      pdfinfoPath: config?.pdfinfoPath ?? documentConverterConfig.pdfinfoPath,
      pdfTimeoutMs: config?.pdfTimeoutMs ?? documentConverterConfig.pdfTimeoutMs,
    };
  }

  async convert(buffer: Buffer, options: WebpConvertOptions): Promise<WebpPages> {
    const workDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'doc-webp-'));
    try {
      const pdfPath = path.join(workDir, 'input.pdf');
      await fs.promises.writeFile(pdfPath, buffer);

      const pageCount = await this.readPageCount(pdfPath);
      if (pageCount > this.config.maxPages) throw new DocumentTooManyPages(pageCount, this.config.maxPages);

      const outDir = path.join(workDir, 'out');
      await fs.promises.mkdir(outDir);
      const prefix = path.join(outDir, 'page');
      await this.run(this.config.pdftoppmPath, ['-png', '-r', String(Math.round(PDF_BASE_DPI * options.scale)), pdfPath, prefix], 'pdftoppm');

      const files = (await fs.promises.readdir(outDir)).filter(f => f.endsWith('.png')).sort(naturalCompare);
      if (files.length === 0) throw new DocumentParseFailed('PDF 에서 페이지를 추출하지 못했습니다.');

      const pages = await mapLimit(files, this.config.encodeConcurrency, (file, i) => this.encode(path.join(outDir, file), i + 1, options));
      return { pageCount: pages.length, pages };
    } finally {
      await fs.promises.rm(workDir, { recursive: true, force: true }).catch(() => undefined);
    }
  }

  async doctor(): Promise<PdfRendererDoctor> {
    const base = { pdftoppm: this.config.pdftoppmPath, pdfinfo: this.config.pdfinfoPath };
    try {
      // pdftoppm -v 는 버전을 stderr 로 찍는다
      const { stdout, stderr } = await this.exec(this.config.pdftoppmPath, ['-v'], { timeout: 5000 });
      const version = `${stdout}${stderr}`
        .split('\n')
        .find(l => l.trim().length > 0)
        ?.trim();
      return { ok: true, ...base, version };
    } catch (e) {
      return { ok: false, ...base, error: (e as Error).message };
    }
  }

  private async readPageCount(pdfPath: string): Promise<number> {
    const { stdout } = await this.run(this.config.pdfinfoPath, [pdfPath], 'pdfinfo');
    const match = /^Pages:\s+(\d+)/m.exec(stdout);
    if (!match) throw new DocumentParseFailed('PDF 페이지 수를 읽지 못했습니다. 손상된 PDF 일 수 있습니다.');
    return Number(match[1]);
  }

  private async run(file: string, args: string[], stage: string): Promise<{ stdout: string; stderr: string }> {
    try {
      return await this.exec(file, args, { timeout: this.config.pdfTimeoutMs });
    } catch (e) {
      const err = e as Error & { code?: string | number; killed?: boolean; signal?: string; stderr?: string };
      if (err.code === 'ENOENT') {
        throw new DocumentConverterUnavailable(`${stage} 를 찾을 수 없습니다. poppler-utils 를 설치하세요.`, { file, reason: err.message });
      }
      if (err.killed || err.signal === 'SIGTERM') {
        throw new DocumentConversionTimeout(stage, this.config.pdfTimeoutMs);
      }
      throw new DocumentParseFailed(`PDF 를 처리하지 못했습니다 (${stage}). 손상되었거나 암호화된 PDF 일 수 있습니다.`, {
        stage,
        stderr: (err.stderr ?? err.message ?? '').toString().trim().slice(-2000),
      });
    }
  }

  private async encode(pngPath: string, page: number, options: WebpConvertOptions): Promise<WebpPage> {
    try {
      const { data, info } = await Sharp(pngPath).webp({ quality: options.quality }).toBuffer({ resolveWithObject: true });
      return { page, width: info.width, height: info.height, bytes: data.length, data };
    } catch (e) {
      throw new DocumentParseFailed(`${page} 페이지를 WebP 로 변환하지 못했습니다.`, { page, reason: (e as Error).message });
    }
  }
}
