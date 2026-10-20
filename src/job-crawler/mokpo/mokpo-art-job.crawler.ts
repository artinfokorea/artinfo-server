import { Inject, Injectable, Logger, Optional } from '@nestjs/common';
import { jobCrawlerConfig } from '../job-crawler.config';
import { CrawlSummary, CrawledJob, JobSourceCrawler, SkippedNotice, emptySummary } from '../source/job-source';
import { JobSourceSupport } from '../source/job-source.support';
import { MokpoNoticeClient, MokpoNoticeGateway } from './mokpo-notice.client';
import { MokpoNoticeRow, parseMokpoNoticeDetail, parseMokpoNoticeList, pickNoticeAttachment } from './mokpo-notice.parser';

export const MOKPO_NOTICE_GATEWAY = 'MOKPO_NOTICE_GATEWAY';

/**
 * 목포시 고시·공고에서 그날 올라온 "목포시립예술단 … 채용" 공고를 찾아 공고문 HWP/HWPX 를 내려받고
 * JobSourceSupport 로 등록한다 (WebP 변환 · S3 · 전공 · 채용 생성은 공통).
 */
@Injectable()
export class MokpoArtJobCrawler implements JobSourceCrawler {
  readonly key = 'mokpo';
  readonly name = '목포시립예술단';
  private readonly logger = new Logger(MokpoArtJobCrawler.name);
  private readonly gateway: MokpoNoticeGateway;

  constructor(
    client: MokpoNoticeClient,
    private readonly support: JobSourceSupport,
    @Optional() @Inject(MOKPO_NOTICE_GATEWAY) gateway?: MokpoNoticeGateway,
  ) {
    this.gateway = gateway ?? client;
  }

  async crawl(date: string): Promise<CrawlSummary> {
    const startedAt = Date.now();
    const rows = await this.collectRows(date);
    const matched = rows.filter(row => this.isTargetTitle(row.title));
    const summary = { ...emptySummary(this, date), scanned: rows.length, matched: matched.length };
    this.logger.log(`목포 공고 ${date}: ${rows.length}건 중 ${matched.length}건 대상`);

    for (const row of matched) {
      try {
        const outcome = await this.register(row, date);
        if ('reason' in outcome) summary.skipped.push(outcome);
        else summary.created.push(outcome);
      } catch (e) {
        const error = e instanceof Error ? e.message : String(e);
        this.logger.error(`목포 공고 등록 실패: ${row.title} (${row.url}) — ${error}`);
        summary.failed.push({ title: row.title, url: row.url, reason: error });
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

  private async register(row: MokpoNoticeRow, date: string): Promise<CrawledJob | SkippedNotice> {
    const existingJobId = await this.support.findRegisteredJobId(row.url);
    if (existingJobId) return { title: row.title, url: row.url, reason: `이미 등록됨 (job ${existingJobId})` };

    const page = await this.gateway.fetchDetail(row.idx);
    const detail = parseMokpoNoticeDetail(page.html);
    const attachment = pickNoticeAttachment(detail.attachments);
    if (!attachment) return { title: row.title, url: row.url, reason: `HWP/HWPX 첨부가 없음 (첨부 ${detail.attachments.length}개)` };

    const buffer = await this.gateway.downloadAttachment(page, detail.csrfToken, attachment);
    const { companyName, address, addressDetail, imageUrl } = jobCrawlerConfig.mokpo;
    return this.support.register({
      source: this.key,
      title: detail.title || row.title,
      url: row.url,
      bodyText: detail.bodyText,
      file: { name: attachment.name, buffer },
      companyName,
      address,
      addressDetail,
      imageUrl,
      date,
    });
  }
}
