import { Inject, Injectable, Logger, Optional } from '@nestjs/common';
import { jobCrawlerConfig } from '../job-crawler.config';
import { CrawlSummary, CrawledJob, JobSourceCrawler, SkippedNotice, emptySummary } from '../source/job-source';
import { JobSourceSupport } from '../source/job-source.support';
import { isRecruitmentTitle } from '../source/title-filter';
import { BoryeongNoticeClient, BoryeongNoticeGateway } from './boryeong-notice.client';
import { BoryeongNoticeRow, parseBoryeongNoticeDetail, parseBoryeongNoticeList, pickBoryeongNoticeAttachment } from './boryeong-notice.parser';

export const BORYEONG_NOTICE_GATEWAY = 'BORYEONG_NOTICE_GATEWAY';

/**
 * 보령문화예술회관 공지사항에서 그날 올라온 "보령시립합창단 … 모집/채용" 공고를 찾아 공고문 HWP/HWPX(없으면 PDF) 를 내려받고
 * JobSourceSupport 로 등록한다 (WebP 변환 · S3 · 전공 · 채용 생성은 공통).
 */
@Injectable()
export class BoryeongChoirJobCrawler implements JobSourceCrawler {
  readonly key = 'boryeong';
  readonly name = '보령시립합창단';
  private readonly logger = new Logger(BoryeongChoirJobCrawler.name);
  private readonly gateway: BoryeongNoticeGateway;

  constructor(
    client: BoryeongNoticeClient,
    private readonly support: JobSourceSupport,
    @Optional() @Inject(BORYEONG_NOTICE_GATEWAY) gateway?: BoryeongNoticeGateway,
  ) {
    this.gateway = gateway ?? client;
  }

  async crawl(date: string): Promise<CrawlSummary> {
    const startedAt = Date.now();
    const rows = await this.collectRows(date);
    const matched = rows.filter(row => isRecruitmentTitle(row.title, jobCrawlerConfig.boryeong.titleKeywords));
    const summary = { ...emptySummary(this, date), scanned: rows.length, matched: matched.length };
    this.logger.log(`보령 공고 ${date}: ${rows.length}건 중 ${matched.length}건 대상`);

    for (const row of matched) {
      try {
        const outcome = await this.register(row, date);
        if ('reason' in outcome) summary.skipped.push(outcome);
        else summary.created.push(outcome);
      } catch (e) {
        const error = e instanceof Error ? e.message : String(e);
        this.logger.error(`보령 공고 등록 실패: ${row.title} (${row.url}) — ${error}`);
        summary.failed.push({ title: row.title, url: row.url, reason: error });
      }
    }
    summary.elapsedMs = Date.now() - startedAt;
    return summary;
  }

  /**
   * 등록일 내림차순 목록을 날짜가 지날 때까지 넘기며 그날 행만 모은다.
   * 고정 공지는 매 페이지 반복되고 날짜 순서와 무관하므로 멈춤 판정에서 빼고, 같은 글은 한 번만 넣는다.
   */
  private async collectRows(date: string): Promise<BoryeongNoticeRow[]> {
    const rows = new Map<string, BoryeongNoticeRow>();
    const { bbsId, maxListPages } = jobCrawlerConfig.boryeong;
    for (let page = 1; page <= maxListPages; page++) {
      const pageRows = parseBoryeongNoticeList(await this.gateway.fetchListPage(page), bbsId);
      const ordinary = pageRows.filter(r => !r.pinned);
      if (ordinary.length === 0) break;
      pageRows.filter(r => r.registeredAt === date).forEach(r => rows.has(r.nttId) || rows.set(r.nttId, r));
      if (ordinary.some(r => r.registeredAt < date)) break;
    }
    return [...rows.values()];
  }

  private async register(row: BoryeongNoticeRow, date: string): Promise<CrawledJob | SkippedNotice> {
    const existingJobId = await this.support.findRegisteredJobId(row.url);
    if (existingJobId) return { title: row.title, url: row.url, reason: `이미 등록됨 (job ${existingJobId})` };

    const detail = parseBoryeongNoticeDetail(await this.gateway.fetchDetail(row.nttId));
    const attachment = pickBoryeongNoticeAttachment(detail.attachments);
    if (!attachment) return { title: row.title, url: row.url, reason: `HWP/HWPX/PDF 첨부가 없음 (첨부 ${detail.attachments.length}개)` };

    const buffer = await this.gateway.downloadAttachment(attachment);
    const { companyName, address, addressDetail, imageUrl, imageFile } = jobCrawlerConfig.boryeong;
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
