import { Inject, Injectable, Logger, Optional } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
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
import { MokpoNoticeClient, MokpoNoticeGateway } from './mokpo-notice.client';
import { MokpoNoticeRow, parseMokpoNoticeDetail, parseMokpoNoticeList, pickNoticeAttachment } from './mokpo-notice.parser';

export const MOKPO_NOTICE_GATEWAY = 'MOKPO_NOTICE_GATEWAY';

export interface CrawledJob {
  jobId: number;
  title: string;
  url: string;
  attachment: string;
  pageCount: number;
  majors: string[];
}

export interface SkippedNotice {
  title: string;
  url: string;
  reason: string;
}

export interface CrawlSummary {
  source: 'mokpo';
  date: string;
  /** 목록에서 읽은 그날 공고 수 */
  scanned: number;
  /** 제목 조건에 맞은 공고 수 */
  matched: number;
  created: CrawledJob[];
  skipped: SkippedNotice[];
  failed: SkippedNotice[];
  elapsedMs: number;
}

/**
 * 목포시 고시·공고에서 그날 올라온 "목포시립예술단 … 채용" 공고를 찾아
 * 공고문 HWP/HWPX 를 WebP 로 바꿔 S3 에 올리고 채용(ART_ORGANIZATION) 으로 등록한다.
 * 같은 공고 URL(recruitSiteUrl) 이 이미 있으면 건너뛴다.
 */
@Injectable()
export class MokpoArtJobCrawler {
  private readonly logger = new Logger(MokpoArtJobCrawler.name);
  private readonly gateway: MokpoNoticeGateway;

  constructor(
    client: MokpoNoticeClient,
    private readonly documentConverter: DocumentConverterService,
    private readonly awsS3Service: AwsS3Service,
    private readonly jobService: JobService,
    private readonly userRepository: UserRepository,
    @InjectRepository(Job) private readonly jobRepository: Repository<Job>,
    @InjectRepository(MajorCategory) private readonly majorCategoryRepository: Repository<MajorCategory>,
    @Optional() @Inject(MOKPO_NOTICE_GATEWAY) gateway?: MokpoNoticeGateway,
  ) {
    this.gateway = gateway ?? client;
  }

  async crawl(date: string): Promise<CrawlSummary> {
    const startedAt = Date.now();
    const rows = await this.collectRows(date);
    const matched = rows.filter(row => this.isTargetTitle(row.title));
    const summary: CrawlSummary = { source: 'mokpo', date, scanned: rows.length, matched: matched.length, created: [], skipped: [], failed: [], elapsedMs: 0 };
    this.logger.log(`목포 공고 ${date}: ${rows.length}건 중 ${matched.length}건 대상`);

    if (matched.length > 0) {
      const user = await this.userRepository.findOneOrThrowByEmail(jobCrawlerConfig.posterEmail);
      for (const row of matched) {
        try {
          const outcome = await this.register(row, user.id, date);
          if ('reason' in outcome) summary.skipped.push(outcome);
          else summary.created.push(outcome);
        } catch (e) {
          const error = e instanceof Error ? e.message : String(e);
          this.logger.error(`목포 공고 등록 실패: ${row.title} (${row.url}) — ${error}`);
          summary.failed.push({ title: row.title, url: row.url, reason: error });
        }
      }
    }
    summary.elapsedMs = Date.now() - startedAt;
    return summary;
  }

  /** 등록일 내림차순 목록을 날짜가 지날 때까지 넘기며 그날 행만 모은다 */
  private async collectRows(date: string): Promise<MokpoNoticeRow[]> {
    const rows: MokpoNoticeRow[] = [];
    for (let page = 1; page <= jobCrawlerConfig.mokpo.maxListPages; page++) {
      const pageRows = parseMokpoNoticeList(await this.gateway.fetchListPage(page));
      if (pageRows.length === 0) break;
      rows.push(...pageRows.filter(r => r.registeredAt === date));
      if (pageRows.some(r => r.registeredAt < date)) break;
    }
    return rows;
  }

  private isTargetTitle(title: string): boolean {
    const compact = title.replace(/\s+/g, '');
    return jobCrawlerConfig.mokpo.titleKeywords.every(keyword => compact.includes(keyword));
  }

  private async register(row: MokpoNoticeRow, userId: number, date: string): Promise<CrawledJob | SkippedNotice> {
    const existing = await this.jobRepository.findOne({ where: { recruitSiteUrl: row.url }, select: { id: true } });
    if (existing) return { title: row.title, url: row.url, reason: `이미 등록됨 (job ${existing.id})` };

    const page = await this.gateway.fetchDetail(row.idx);
    const detail = parseMokpoNoticeDetail(page.html);
    const attachment = pickNoticeAttachment(detail.attachments);
    if (!attachment) return { title: row.title, url: row.url, reason: `HWP/HWPX 첨부가 없음 (첨부 ${detail.attachments.length}개)` };

    const file = await this.gateway.downloadAttachment(page, detail.csrfToken, attachment);
    const converted = await this.documentConverter.convertToWebp(file, attachment.name, {
      scale: jobCrawlerConfig.imageScale,
      quality: jobCrawlerConfig.imageQuality,
    });

    const images: { url: string; width: number; height: number }[] = [];
    const util = new Util();
    const dateKey = date.replace(/-/g, '');
    for (const p of converted.pages) {
      const key = ['upload', userId, 'jobs', dateKey, 'original', `${util.generateRandomString(11)}.${Date.now()}.webp`].join('/');
      const uploaded = await this.awsS3Service.uploadStream(p.data, 'image/webp', key);
      if (!uploaded) throw new Error(`S3 업로드 실패: ${key}`);
      images.push({ url: uploaded.location, width: p.width, height: p.height });
    }

    const majors = extractMajors(`${detail.title}\n${detail.bodyText}`);
    const majorIds = majors.length ? (await this.majorCategoryRepository.findBy({ enName: In(majors) })).map(m => m.id) : [];
    if (majors.length === 0) this.logger.warn(`전공을 찾지 못함: ${row.title}`);

    const jobId = await this.jobService.createJob(
      new CreateJobCommand({
        userId,
        type: JOB_TYPE.ART_ORGANIZATION,
        title: detail.title || row.title,
        contents: buildContentsHtml(detail.bodyText, images),
        companyName: jobCrawlerConfig.mokpo.companyName,
        recruitSiteUrl: row.url,
        imageUrl: null,
        address: jobCrawlerConfig.mokpo.address,
        addressDetail: null,
        fee: null,
        majorIds,
        startAt: null,
        endAt: null,
      }),
    );
    this.logger.log(`목포 공고 등록: job ${jobId} "${detail.title}" (${converted.pageCount}p, 전공 ${majors.join(',') || '없음'})`);
    return { jobId, title: detail.title || row.title, url: row.url, attachment: attachment.name, pageCount: converted.pageCount, majors };
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
