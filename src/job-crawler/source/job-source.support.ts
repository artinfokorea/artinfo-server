import * as fs from 'fs';
import * as path from 'path';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as Sharp from 'sharp';
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

export interface NoticeFile {
  name: string;
  buffer: Buffer;
}

export interface NoticeRegistration {
  /** 소스 키 — 로고 S3 경로에 쓴다 */
  source: string;
  title: string;
  /** 원문 URL — recruitSiteUrl 이자 중복 판정 키 */
  url: string;
  bodyText: string;
  /** 공고문 파일 (HWP/HWPX/PDF). 없으면 images 가 공고문이다 */
  file?: NoticeFile;
  /** 공고문을 그림으로 올린 글의 본문 이미지 (PNG/JPG 등). 파일 페이지 뒤에 그대로 WebP 로 바꿔 붙인다 */
  images?: NoticeFile[];
  companyName: string;
  address: string;
  addressDetail: string | null;
  /** 채용 대표 이미지 URL (없으면 null) */
  imageUrl: string | null;
  /** 수집 날짜 (S3 경로) */
  date: string;
}

/**
 * 소스마다 공통인 등록 절차: 중복 확인 → 공고문 WebP 변환(문서 페이지 · 본문 이미지) → S3 업로드 → 전공 추출 → 채용 생성.
 * 소스 크롤러는 사이트에서 공고를 찾아 파일을 내려받는 일만 하고, 등록은 여기로 넘긴다.
 * 전공은 선택이다 — 제목·본문에서 찾히면 달고, 못 찾으면(공고문이 이미지뿐인 경우 등) 전공 없이 등록한다.
 */
@Injectable()
export class JobSourceSupport {
  private readonly logger = new Logger(JobSourceSupport.name);
  private posterId?: Promise<number>;
  /** 소스별 로고 업로드 결과 (프로세스당 한 번만 올린다) */
  private readonly logos = new Map<string, Promise<string>>();

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
    if (!input.file && !input.images?.length) throw new Error(`공고문 파일도 본문 이미지도 없음: ${input.title}`);
    const userId = await this.posterUserId();
    const pages = await this.toWebpPages(input);

    const images: { url: string; width: number; height: number }[] = [];
    const util = new Util();
    const dateKey = input.date.replace(/-/g, '');
    for (const p of pages) {
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
        imageUrl: input.imageUrl,
        address: input.address,
        addressDetail: input.addressDetail,
        fee: null,
        majorIds,
        startAt: null,
        endAt: null,
      }),
    );
    const attachment = input.file?.name ?? `본문 이미지 ${input.images?.length ?? 0}장`;
    this.logger.log(`[${input.source}] 채용 등록: job ${jobId} "${input.title}" (${attachment}, ${pages.length}p, 전공 ${majors.join(',') || '없음'})`);
    return { jobId, title: input.title, url: input.url, attachment, pageCount: pages.length, majors };
  }

  /** 공고문 파일은 DocumentConverter 로 페이지마다, 본문 이미지는 sharp 로 한 장씩 WebP 로 바꾼다 (파일 페이지 → 이미지 순) */
  private async toWebpPages(input: NoticeRegistration): Promise<{ data: Buffer; width: number; height: number }[]> {
    const { imageScale: scale, imageQuality: quality } = jobCrawlerConfig;
    const pages: { data: Buffer; width: number; height: number }[] = [];
    if (input.file) {
      const converted = await this.documentConverter.convertToWebp(input.file.buffer, input.file.name, { scale, quality });
      pages.push(...converted.pages.map(p => ({ data: p.data, width: p.width, height: p.height })));
    }
    for (const image of input.images ?? []) {
      const { data, info } = await Sharp(image.buffer).webp({ quality }).toBuffer({ resolveWithObject: true });
      pages.push({ data, width: info.width, height: info.height });
    }
    return pages;
  }

  /**
   * 저장소에 든 소스 로고 파일을 S3(upload/{userId}/jobs/logo/{source}.{ext}) 에 올리고 URL 을 돌려준다.
   * 키가 고정이라 다시 올려도 같은 URL 이고, 프로세스 안에서는 한 번만 올린다. 실패하면 다음 호출에서 다시 시도한다.
   */
  logoUrl(source: string, filePath: string): Promise<string> {
    let pending = this.logos.get(source);
    if (!pending) {
      pending = (async () => {
        const [userId, buffer] = await Promise.all([this.posterUserId(), fs.promises.readFile(path.resolve(filePath))]);
        const ext = path.extname(filePath).slice(1).toLowerCase();
        const mimeType = ext === 'png' ? 'image/png' : ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : 'application/octet-stream';
        return this.upload(buffer, mimeType, `upload/${userId}/jobs/logo/${source}.${ext}`);
      })();
      pending.catch(() => this.logos.delete(source));
      this.logos.set(source, pending);
    }
    return pending;
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
