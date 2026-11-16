import { Inject, Injectable, Logger, Optional } from '@nestjs/common';
import { jobCrawlerConfig } from '../job-crawler.config';
import { CrawlSummary, CrawledJob, JobSourceCrawler, SkippedNotice, emptySummary } from '../source/job-source';
import { JobSourceSupport, NoticeFile } from '../source/job-source.support';
import { isRecruitmentTitle } from '../source/title-filter';
import { SejongNoticeClient, SejongNoticeGateway } from './sejong-notice.client';
import { SejongNoticeRow, parseSejongNoticeDetail, parseSejongNoticeList, pickSejongFallbackDocument, pickSejongNoticeDocument } from './sejong-notice.parser';

export const SEJONG_NOTICE_GATEWAY = 'SEJONG_NOTICE_GATEWAY';

/**
 * 세종문화회관 채용공고 게시판에서 그날 올라온 서울시예술단(국악관현악단·무용단·합창단·뮤지컬단·오페라단·극단) 단원 모집/채용 공고를 찾아 등록한다.
 * 세종은 공고문을 첨부하지 않고 본문에 채용 사이트 템플릿(글+표) 이나 큰 그림 한 장으로 올린다 →
 * ① '공고' 가 든 HWP/HWPX/PDF 첨부 → ② 본문 이미지 → ③ 보조 문서(세부사항·평가기준) 순으로 페이지를 얻고, 본문 글은 bodyText 로 함께 등록한다.
 * 등록(WebP 변환 · S3 · 전공 · 채용 생성)은 JobSourceSupport 가 맡는다.
 */
@Injectable()
export class SejongArtsJobCrawler implements JobSourceCrawler {
  readonly key = 'sejong';
  readonly name = '서울시예술단';
  private readonly logger = new Logger(SejongArtsJobCrawler.name);
  private readonly gateway: SejongNoticeGateway;

  constructor(
    client: SejongNoticeClient,
    private readonly support: JobSourceSupport,
    @Optional() @Inject(SEJONG_NOTICE_GATEWAY) gateway?: SejongNoticeGateway,
  ) {
    this.gateway = gateway ?? client;
  }

  async crawl(date: string): Promise<CrawlSummary> {
    const startedAt = Date.now();
    const rows = await this.collectRows(date);
    const { titleKeywords, excludedTitleKeywords } = jobCrawlerConfig.sejong;
    const matched = rows.filter(row => isRecruitmentTitle(row.title, titleKeywords, excludedTitleKeywords));
    const summary = { ...emptySummary(this, date), scanned: rows.length, matched: matched.length };
    this.logger.log(`세종 공고 ${date}: ${rows.length}건 중 ${matched.length}건 대상`);

    for (const row of matched) {
      try {
        const outcome = await this.register(row, date);
        if ('reason' in outcome) summary.skipped.push(outcome);
        else summary.created.push(outcome);
      } catch (e) {
        const error = e instanceof Error ? e.message : String(e);
        this.logger.error(`세종 공고 등록 실패: ${row.title} (${row.url}) — ${error}`);
        summary.failed.push({ title: row.title, url: row.url, reason: error });
      }
    }
    summary.elapsedMs = Date.now() - startedAt;
    return summary;
  }

  /** 날짜 내림차순 목록을 날짜가 지날 때까지 넘기며 그날 행만 모은다. 고정 글은 날짜가 맞으면 담되 멈춤 판정에서는 뺀다 */
  private async collectRows(date: string): Promise<SejongNoticeRow[]> {
    const rows = new Map<string, SejongNoticeRow>();
    const { origin, maxListPages } = jobCrawlerConfig.sejong;
    for (let page = 1; page <= maxListPages; page++) {
      const pageRows = parseSejongNoticeList(await this.gateway.fetchListPage(page), origin);
      const ordinary = pageRows.filter(r => !r.pinned);
      pageRows.filter(r => r.registeredAt === date).forEach(r => rows.has(r.id) || rows.set(r.id, r));
      if (ordinary.length === 0 || ordinary.some(r => r.registeredAt < date)) break;
    }
    return [...rows.values()];
  }

  private async register(row: SejongNoticeRow, date: string): Promise<CrawledJob | SkippedNotice> {
    const existingJobId = await this.support.findRegisteredJobId(row.url);
    if (existingJobId) return { title: row.title, url: row.url, reason: `이미 등록됨 (job ${existingJobId})` };

    const detail = parseSejongNoticeDetail(await this.gateway.fetchDetail(row), jobCrawlerConfig.sejong.origin);
    let document = pickSejongNoticeDocument(detail.attachments);
    const images: NoticeFile[] = [];
    if (!document) {
      for (const image of detail.images) images.push({ name: image.name, buffer: await this.gateway.download(image.url, row.url) });
      if (images.length === 0) document = pickSejongFallbackDocument(detail.attachments);
      if (images.length === 0 && !document) {
        return { title: row.title, url: row.url, reason: `공고문이 없음 (첨부 ${detail.attachments.length}개, 본문 이미지 0장)` };
      }
    }
    const file: NoticeFile | undefined = document ? { name: document.name, buffer: await this.gateway.download(document.url, row.url) } : undefined;

    const { companyName, address, addressDetail, imageUrl, imageFile } = jobCrawlerConfig.sejong;
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
