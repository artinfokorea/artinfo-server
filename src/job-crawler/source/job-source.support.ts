import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { In, Repository } from 'typeorm';
import { AwsS3Service } from '@/aws/s3/aws-s3.service';
import { Util } from '@/common/util/util';
import { DocumentConverterService } from '@/document-converter/service/document-converter.service';
import { CreateJobCommand } from '@/job/dto/command/create-job.command';
import { JOB_TYPE, Job } from '@/job/entity/job.entity';
import { MajorCategory } from '@/job/entity/major-category.entity';
import { JobService } from '@/job/service/job.service';
import { UserRepository } from '@/user/repository/user.repository';
import { jobCrawlerConfig } from '../job-crawler.config';
import { extractMajors } from '../major/major-keyword';
import { CrawledJob } from './job-source';

export interface NoticeRegistration {
  /** 소스 키 — 로고 S3 경로에 쓴다 */
  source: string;
  title: string;
  /** 원문 URL — recruitSiteUrl 이자 중복 판정 키 */
  url: string;
  bodyText: string;
  /** 공고문 파일 (HWP/HWPX/PDF) */
  file: { name: string; buffer: Buffer };
  companyName: string;
  address: string;
  addressDetail: string | null;
  /** src/job-crawler/assets 안의 로고 파일명. 있으면 S3 에 올려 imageUrl 로 쓴다 */
  logoAsset?: string;
  /** 수집 날짜 (S3 경로) */
  date: string;
}

/** 로고 PNG 는 소스 코드와 함께 두고(nest-cli assets 로 dist 에 복사) 프로세스당 한 번 S3 에 올린다 */
const ASSETS_DIR = path.join(__dirname, '..', 'assets');

/**
 * 소스마다 공통인 등록 절차: 중복 확인 → 공고문 WebP 변환 → S3 업로드 → 전공 추출 → 채용 생성.
 * 소스 크롤러는 사이트에서 공고를 찾아 파일을 내려받는 일만 하고, 등록은 여기로 넘긴다.
 */
@Injectable()
export class JobSourceSupport {
  private readonly logger = new Logger(JobSourceSupport.name);
  private posterId?: Promise<number>;
  private readonly logoUrls = new Map<string, Promise<string>>();

  constructor(
    private readonly documentConverter: DocumentConverterService,
    private readonly awsS3Service: AwsS3Service,
    private readonly jobService: JobService,
    private readonly userRepository: UserRepository,
    @InjectRepository(Job) private readonly jobRepository: Repository<Job>,
    @InjectRepository(MajorCategory) private readonly majorCategoryRepository: Repository<MajorCategory>,
  ) {}

  /** 같은 원문 URL 로 등록된 채용 id (없으면 null) */
  async findRegisteredJobId(url: string): Promise<number | null> {
    const existing = await this.jobRepository.findOne({ where: { recruitSiteUrl: url }, select: { id: true } });
    return existing?.id ?? null;
  }

  async register(input: NoticeRegistration): Promise<CrawledJob> {
    const userId = await this.posterUserId();
    // 로고가 없으면 페이지를 올리기 전에 실패시킨다 (쓸모없는 업로드 방지)
    const imageUrl = input.logoAsset ? await this.logoUrl(input.source, input.logoAsset) : null;
    const converted = await this.documentConverter.convertToWebp(input.file.buffer, input.file.name, {
      scale: jobCrawlerConfig.imageScale,
      quality: jobCrawlerConfig.imageQuality,
    });

    const images: { url: string; width: number; height: number }[] = [];
    const util = new Util();
    const dateKey = input.date.replace(/-/g, '');
    for (const p of converted.pages) {
      const key = ['upload', userId, 'jobs', dateKey, 'original', `${util.generateRandomString(11)}.${Date.now()}.webp`].join('/');
      images.push({ url: await this.upload(p.data, 'image/webp', key), width: p.width, height: p.height });
    }

    const majors = extractMajors(`${input.title}\n${input.bodyText}`);
    const majorIds = majors.length ? (await this.majorCategoryRepository.findBy({ enName: In(majors) })).map(m => m.id) : [];
    if (majors.length === 0) this.logger.warn(`전공을 찾지 못함: ${input.title}`);

    const jobId = await this.jobService.createJob(
      new CreateJobCommand({
        userId,
        type: JOB_TYPE.ART_ORGANIZATION,
        title: input.title,
        contents: buildContentsHtml(input.bodyText, images),
        companyName: input.companyName,
        recruitSiteUrl: input.url,
        imageUrl,
        address: input.address,
        addressDetail: input.addressDetail,
        fee: null,
        majorIds,
        startAt: null,
        endAt: null,
      }),
    );
    this.logger.log(`[${input.source}] 채용 등록: job ${jobId} "${input.title}" (${converted.pageCount}p, 전공 ${majors.join(',') || '없음'})`);
    return { jobId, title: input.title, url: input.url, attachment: input.file.name, pageCount: converted.pageCount, majors };
  }

  private posterUserId(): Promise<number> {
    if (!this.posterId) {
      this.posterId = this.userRepository.findOneOrThrowByEmail(jobCrawlerConfig.posterEmail).then(u => u.id);
      this.posterId.catch(() => {
        this.posterId = undefined;
      });
    }
    return this.posterId;
  }

  /** 로고는 소스당 한 번만 올린다 (같은 키에 덮어쓰므로 여러 번 올라가도 무방) */
  private logoUrl(source: string, asset: string): Promise<string> {
    let pending = this.logoUrls.get(source);
    if (!pending) {
      const file = path.join(ASSETS_DIR, asset);
      pending = fs.promises
        .readFile(file)
        .then(buffer => this.upload(buffer, mimeOf(asset), ['upload', 'job-crawler', source, asset.replace(/[^A-Za-z0-9._-]/g, '_')].join('/')))
        .catch(e => {
          this.logoUrls.delete(source);
          throw new Error(`로고 업로드 실패 (${file}): ${(e as Error).message}`);
        });
      this.logoUrls.set(source, pending);
    }
    return pending;
  }

  private async upload(buffer: Buffer, mimeType: string, key: string): Promise<string> {
    const uploaded = await this.awsS3Service.uploadStream(buffer, mimeType, key);
    if (!uploaded) throw new Error(`S3 업로드 실패: ${key}`);
    return uploaded.location;
  }
}

/** 본문 줄은 <p>, 공고문 페이지는 기존 채용 첨부(FileConverter) 와 같은 <figure class="image"> 마크업 */
export function buildContentsHtml(bodyText: string, images: { url: string; width: number; height: number }[]): string {
  const paragraphs = bodyText
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .map(line => `<p>${escapeHtml(line)}</p>`)
    .join('');
  const figures = images
    .map(
      img =>
        `<figure class="image"><img style="aspect-ratio:${img.width}/${img.height};" src="${img.url}" width="${img.width}" height="${img.height}"></figure>`,
    )
    .join('');
  return `${paragraphs}${figures}`;
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function mimeOf(file: string): string {
  const ext = file.slice(file.lastIndexOf('.') + 1).toLowerCase();
  return (
    { png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', webp: 'image/webp', gif: 'image/gif', svg: 'image/svg+xml' }[ext] ?? 'application/octet-stream'
  );
}
