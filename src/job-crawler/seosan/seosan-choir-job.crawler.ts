import { Inject, Injectable, Logger, Optional } from '@nestjs/common';
import { jobCrawlerConfig } from '../job-crawler.config';
import { CrawlSummary, CrawledJob, JobSourceCrawler, SkippedNotice, emptySummary } from '../source/job-source';
import { JobSourceSupport } from '../source/job-source.support';
import { isRecruitmentTitle } from '../source/title-filter';
import { SeosanNoticeClient, SeosanNoticeGateway } from './seosan-notice.client';
import { SeosanNoticeRow, parseSeosanNoticeDetail, parseSeosanNoticeList, pickSeosanNoticeAttachment } from './seosan-notice.parser';

export const SEOSAN_NOTICE_GATEWAY = 'SEOSAN_NOTICE_GATEWAY';

/**
 * 서산시 채용공고에서 그날 올라온 "…시립합창단 … 모집/채용" 공고를 찾아 공고문 HWP/HWPX(없으면 PDF) 를 내려받고
 * JobSourceSupport 로 등록한다 (WebP 변환 · S3 · 전공 · 채용 생성은 공통).
 */
@Injectable()
export class SeosanChoirJobCrawler implements JobSourceCrawler {
  readonly key = 'seosan';
  readonly name = '서산시립합창단';
  private readonly logger = new Logger(SeosanChoirJobCrawler.name);
  private readonly gateway: SeosanNoticeGateway;

  constructor(
    client: SeosanNoticeClient,
    private readonly support: JobSourceSupport,
    @Optional() @Inject(SEOSAN_NOTICE_GATEWAY) gateway?: SeosanNoticeGateway,
  ) {
    this.gateway = gateway ?? client;
  }

  async crawl(date: string): Promise<CrawlSummary> {
    const startedAt = Date.now();
    const rows = await this.collectRows(date);
    const matched = rows.filter(row => isRecruitmentTitle(row.title, jobCrawlerConfig.seosan.titleKeywords));
    const summary = { ...emptySummary(this, date), scanned: rows.length, matched: matched.length };
    this.logger.log(`서산 공고 ${date}: ${rows.length}건 중 ${matched.length}건 대상`);

    for (const row of matched) {
      try {
        const outcome = await this.register(row, date);
        if ('reason' in outcome) summary.skipped.push(outcome);
        else summary.created.push(outcome);
      } catch (e) {
        const error = e instanceof Error ? e.message : String(e);
        this.logger.error(`서산 공고 등록 실패: ${row.title} (${row.url}) — ${error}`);
        summary.failed.push({ title: row.title, url: row.url, reason: error });
      }
    }
    summary.elapsedMs = Date.now() - startedAt;
    return summary;
  }

  /** 등록일 내림차순 목록을 날짜가 지날 때까지 넘기며 그날 행만 모은다 (고정 공지 없음). 빈 페이지가 나오면 멈춘다 */
  private async collectRows(date: string): Promise<SeosanNoticeRow[]> {
    const rows = new Map<string, SeosanNoticeRow>();
    for (let page = 1; page <= jobCrawlerConfig.seosan.maxListPages; page++) {
      const pageRows = parseSeosanNoticeList(await this.gateway.fetchListPage(page));
      if (pageRows.length === 0) break;
      pageRows.filter(r => r.registeredAt === date).forEach(r => rows.has(r.mgtNo) || rows.set(r.mgtNo, r));
      if (pageRows.some(r => r.registeredAt < date)) break;
    }
    return [...rows.values()];
  }

  private async register(row: SeosanNoticeRow, date: string): Promise<CrawledJob | SkippedNotice> {
    const existingJobId = await this.support.findRegisteredJobId(row.url);
    if (existingJobId) return { title: row.title, url: row.url, reason: `이미 등록됨 (job ${existingJobId})` };

    const detail = parseSeosanNoticeDetail(await this.gateway.fetchDetail(row.mgtNo));
    const attachment = pickSeosanNoticeAttachment(detail.attachments);
    if (!attachment) return { title: row.title, url: row.url, reason: `HWP/HWPX/PDF 첨부가 없음 (첨부 ${detail.attachments.length}개)` };

    const buffer = await this.gateway.downloadAttachment(attachment);
    const { companyName, address, addressDetail, imageUrl, imageFile } = jobCrawlerConfig.seosan;
    return this.support.register({
      source: this.key,
      title: detail.title || row.title,
      url: row.url,
      bodyText: detail.bodyText,
      file: { name: attachment.name, buffer },
      companyName,
      address,
      addressDetail,
      imageUrl: imageUrl || (await this.support.logoUrl(this.key, imageFile)),
      date,
    });
  }
}
