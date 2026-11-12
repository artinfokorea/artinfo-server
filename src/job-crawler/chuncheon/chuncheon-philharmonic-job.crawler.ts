import { Inject, Injectable, Logger, Optional } from '@nestjs/common';
import { jobCrawlerConfig } from '../job-crawler.config';
import { CrawlSummary, CrawledJob, JobSourceCrawler, SkippedNotice, emptySummary } from '../source/job-source';
import { JobSourceSupport, NoticeFile } from '../source/job-source.support';
import { isRecruitmentTitle } from '../source/title-filter';
import { ChuncheonNoticeClient, ChuncheonNoticeGateway } from './chuncheon-notice.client';
import { ChuncheonNoticeRow, parseChuncheonNoticeDetail, parseChuncheonNoticeList, pickChuncheonNoticeDocument } from './chuncheon-notice.parser';

export const CHUNCHEON_NOTICE_GATEWAY = 'CHUNCHEON_NOTICE_GATEWAY';

/**
 * 춘천시립예술단 채용공고 게시판에서 그날 올라온 "춘천시립교향악단 … 모집/채용/선발" 공고를 찾아 등록한다.
 * 공고문은 ① '공고' 가 든 HWP/HWPX/PDF 첨부 → ② 본문 이미지(춘천은 보통 공고문을 그림으로 올리고 응시원서·과제곡만 첨부한다) 순으로 얻고,
 * 등록(WebP 변환 · S3 · 전공 · 채용 생성)은 JobSourceSupport 가 맡는다.
 */
@Injectable()
export class ChuncheonPhilharmonicJobCrawler implements JobSourceCrawler {
  readonly key = 'chuncheon';
  readonly name = '춘천시립교향악단';
  private readonly logger = new Logger(ChuncheonPhilharmonicJobCrawler.name);
  private readonly gateway: ChuncheonNoticeGateway;

  constructor(
    client: ChuncheonNoticeClient,
    private readonly support: JobSourceSupport,
    @Optional() @Inject(CHUNCHEON_NOTICE_GATEWAY) gateway?: ChuncheonNoticeGateway,
  ) {
    this.gateway = gateway ?? client;
  }

  async crawl(date: string): Promise<CrawlSummary> {
    const startedAt = Date.now();
    const rows = await this.collectRows(date);
    const { titleKeywords, excludedTitleKeywords } = jobCrawlerConfig.chuncheon;
    const matched = rows.filter(row => isRecruitmentTitle(row.title, titleKeywords, excludedTitleKeywords));
    const summary = { ...emptySummary(this, date), scanned: rows.length, matched: matched.length };
    this.logger.log(`춘천 공고 ${date}: ${rows.length}건 중 ${matched.length}건 대상`);

    for (const row of matched) {
      try {
        const outcome = await this.register(row, date);
        if ('reason' in outcome) summary.skipped.push(outcome);
        else summary.created.push(outcome);
      } catch (e) {
        const error = e instanceof Error ? e.message : String(e);
        this.logger.error(`춘천 공고 등록 실패: ${row.title} (${row.url}) — ${error}`);
        summary.failed.push({ title: row.title, url: row.url, reason: error });
      }
    }
    summary.elapsedMs = Date.now() - startedAt;
    return summary;
  }

  /** 등록일 내림차순 목록을 날짜가 지날 때까지 넘기며 그날 행만 모은다. 고정 글(1페이지)은 날짜가 맞으면 담되 멈춤 판정에서는 뺀다 */
  private async collectRows(date: string): Promise<ChuncheonNoticeRow[]> {
    const rows = new Map<string, ChuncheonNoticeRow>();
    const { origin, maxListPages } = jobCrawlerConfig.chuncheon;
    for (let page = 1; page <= maxListPages; page++) {
      const pageRows = parseChuncheonNoticeList(await this.gateway.fetchListPage(page), origin);
      const ordinary = pageRows.filter(r => !r.pinned);
      pageRows.filter(r => r.registeredAt === date).forEach(r => rows.has(r.id) || rows.set(r.id, r));
      if (ordinary.length === 0 || ordinary.some(r => r.registeredAt < date)) break;
    }
    return [...rows.values()];
  }

  private async register(row: ChuncheonNoticeRow, date: string): Promise<CrawledJob | SkippedNotice> {
    const existingJobId = await this.support.findRegisteredJobId(row.url);
    if (existingJobId) return { title: row.title, url: row.url, reason: `이미 등록됨 (job ${existingJobId})` };

    const detail = parseChuncheonNoticeDetail(await this.gateway.fetchDetail(row), jobCrawlerConfig.chuncheon.origin);
    const document = pickChuncheonNoticeDocument(detail.attachments);
    const file: NoticeFile | undefined = document ? { name: document.name, buffer: await this.gateway.download(document.url, row.url) } : undefined;
    const images: NoticeFile[] = [];
    if (!file) {
      if (detail.images.length === 0) {
        return { title: row.title, url: row.url, reason: `공고문이 없음 (첨부 ${detail.attachments.length}개, 본문 이미지 0장)` };
      }
      for (const image of detail.images) images.push({ name: image.name, buffer: await this.gateway.download(image.url, row.url) });
    }

    const { companyName, address, addressDetail, imageUrl, imageFile } = jobCrawlerConfig.chuncheon;
    return this.support.register({
      source: this.key,
      title: detail.title || row.title,
      url: row.url,
      bodyText: detail.bodyText,
      file,
      images,
      companyName,
      address,
      addressDetail,
      imageUrl: imageUrl || (await this.support.logoUrl(this.key, imageFile)),
      date,
    });
  }
}
