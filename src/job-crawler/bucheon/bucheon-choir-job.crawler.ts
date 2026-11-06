import { Inject, Injectable, Logger, Optional } from '@nestjs/common';
import { jobCrawlerConfig } from '../job-crawler.config';
import { CrawlSummary, CrawledJob, JobSourceCrawler, SkippedNotice, emptySummary } from '../source/job-source';
import { JobSourceSupport, NoticeFile } from '../source/job-source.support';
import { isRecruitmentTitle } from '../source/title-filter';
import { readZipEntries } from '../source/zip-reader';
import { BucheonNoticeClient, BucheonNoticeGateway } from './bucheon-notice.client';
import {
  BUCHEON_BOARDS,
  BucheonBoard,
  BucheonNoticeDetail,
  BucheonNoticeRow,
  fileNameAndExt,
  parseBucheonNoticeDetail,
  parseBucheonNoticeList,
  pickBucheonNoticeDocument,
  pickBucheonNoticeZip,
} from './bucheon-notice.parser';

export const BUCHEON_NOTICE_GATEWAY = 'BUCHEON_NOTICE_GATEWAY';

/**
 * 부천시립예술단 누리집의 공지사항 · 단원채용 두 게시판에서 그날 올라온 "부천시립합창단 … 모집/채용" 공고를 찾아 등록한다.
 * 공고문은 ① HWP/HWPX/PDF 첨부 → ② ZIP 첨부 안의 공고문 → ③ 본문 이미지(공고문을 그림으로 올린 글) 순으로 얻고,
 * 등록(WebP 변환 · S3 · 전공 · 채용 생성)은 JobSourceSupport 가 맡는다. 전공은 본문·제목에서 찾히면 달고 없으면 없이 등록한다.
 */
@Injectable()
export class BucheonChoirJobCrawler implements JobSourceCrawler {
  readonly key = 'bucheon';
  readonly name = '부천시립합창단';
  private readonly logger = new Logger(BucheonChoirJobCrawler.name);
  private readonly gateway: BucheonNoticeGateway;

  constructor(
    client: BucheonNoticeClient,
    private readonly support: JobSourceSupport,
    @Optional() @Inject(BUCHEON_NOTICE_GATEWAY) gateway?: BucheonNoticeGateway,
  ) {
    this.gateway = gateway ?? client;
  }

  async crawl(date: string): Promise<CrawlSummary> {
    const startedAt = Date.now();
    const rows: BucheonNoticeRow[] = [];
    for (const board of Object.keys(BUCHEON_BOARDS) as BucheonBoard[]) rows.push(...(await this.collectRows(board, date)));
    const matched = rows.filter(row => isRecruitmentTitle(row.title, jobCrawlerConfig.bucheon.titleKeywords));
    const summary = { ...emptySummary(this, date), scanned: rows.length, matched: matched.length };
    this.logger.log(`부천 공고 ${date}: ${rows.length}건 중 ${matched.length}건 대상`);

    for (const row of matched) {
      try {
        const outcome = await this.register(row, date);
        if ('reason' in outcome) summary.skipped.push(outcome);
        else summary.created.push(outcome);
      } catch (e) {
        const error = e instanceof Error ? e.message : String(e);
        this.logger.error(`부천 공고 등록 실패: ${row.title} (${row.url}) — ${error}`);
        summary.failed.push({ title: row.title, url: row.url, reason: error });
      }
    }
    summary.elapsedMs = Date.now() - startedAt;
    return summary;
  }

  /** 등록일 내림차순 목록을 날짜가 지날 때까지 넘기며 그날 행만 모은다 (고정 공지 없음). 빈 페이지가 나오면 멈춘다 */
  private async collectRows(board: BucheonBoard, date: string): Promise<BucheonNoticeRow[]> {
    const rows = new Map<string, BucheonNoticeRow>();
    const { origin, maxListPages } = jobCrawlerConfig.bucheon;
    for (let page = 1; page <= maxListPages; page++) {
      const pageRows = parseBucheonNoticeList(await this.gateway.fetchListPage(board, page), board, origin);
      if (pageRows.length === 0) break;
      pageRows.filter(r => r.registeredAt === date).forEach(r => rows.has(r.id) || rows.set(r.id, r));
      if (pageRows.some(r => r.registeredAt < date)) break;
    }
    return [...rows.values()];
  }

  private async register(row: BucheonNoticeRow, date: string): Promise<CrawledJob | SkippedNotice> {
    const existingJobId = await this.support.findRegisteredJobId(row.url);
    if (existingJobId) return { title: row.title, url: row.url, reason: `이미 등록됨 (job ${existingJobId})` };

    const detail = parseBucheonNoticeDetail(await this.gateway.fetchDetail(row), jobCrawlerConfig.bucheon.origin);
    const file = await this.findDocument(detail, row);
    const images: NoticeFile[] = [];
    if (!file) {
      if (detail.images.length === 0) {
        return { title: row.title, url: row.url, reason: `공고문이 없음 (첨부 ${detail.attachments.length}개, 본문 이미지 0장)` };
      }
      for (const image of detail.images) images.push({ name: image.name, buffer: await this.gateway.download(image.url, row.url) });
    }

    const { companyName, address, addressDetail, imageUrl, imageFile } = jobCrawlerConfig.bucheon;
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

  /**
   * 공고문 파일: HWP/HWPX/PDF 첨부가 있으면 그것, 없으면 ZIP 첨부를 받아 안에서 고른다.
   * ZIP 을 못 받거나 안에 공고문이 없으면 본문 이미지가 있을 때만 없다고 돌려주고(이미지로 대신), 이미지도 없으면 오류를 그대로 올린다.
   */
  private async findDocument(detail: BucheonNoticeDetail, row: BucheonNoticeRow): Promise<NoticeFile | undefined> {
    const direct = pickBucheonNoticeDocument(detail.attachments);
    if (direct) return { name: direct.name, buffer: await this.gateway.download(direct.url, row.url) };

    const zip = pickBucheonNoticeZip(detail.attachments);
    if (!zip) return undefined;
    try {
      const entries = readZipEntries(await this.gateway.download(zip.url, row.url)).map(entry => ({ ...fileNameAndExt(entry.name), entry }));
      const picked = pickBucheonNoticeDocument(entries);
      if (picked) return { name: picked.name, buffer: picked.entry.data() };
      this.logger.warn(`부천 공고 ZIP 에 공고문이 없음: ${zip.name} (${entries.map(e => e.name).join(', ') || '빈 압축'})`);
      return undefined;
    } catch (e) {
      if (detail.images.length === 0) throw e;
      this.logger.warn(`부천 공고 ZIP 처리 실패, 본문 이미지로 대신한다: ${zip.name} — ${e instanceof Error ? e.message : String(e)}`);
      return undefined;
    }
  }
}
