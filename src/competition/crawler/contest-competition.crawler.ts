import { Inject, Injectable, Logger, Optional } from '@nestjs/common';
import { dedupeKey } from '../competition-dedupe';
import { CompetitionRepository } from '../competition.repository';
import { CompetitionWrite } from '../competition.types';
import { CompetitionImageStore } from './competition-image.store';
import { ContestNoticeClient, ContestNoticeGateway } from './contest-notice.client';
import {
  CONTEST_LIST_PAGE_SIZE,
  ContestListRow,
  inferAges,
  inferDivisions,
  isCompetitionTitle,
  parseContestDetail,
  parseContestList,
} from './contest-notice.parser';

export const CONTEST_NOTICE_GATEWAY = 'CONTEST_NOTICE_GATEWAY';
/** 수동 수집에서 볼 수 있는 최대 건수 (4페이지) */
export const CRAWL_MAX_LIMIT = 200;
/** 수집 공고를 등록하는 운영 계정 (채용 크롤러와 같은 계정) — 이 계정으로 로그인하면 수정·삭제가 보인다 */
export const CRAWL_POSTER_EMAIL = process.env.COMPETITION_CRAWLER_POSTER_EMAIL ?? 'artinfokorea2022@gmail.com';

export interface CompetitionCrawlSummary {
  source: 'contest';
  /** 목록에서 읽은 행 수 */
  scanned: number;
  /** 콩쿠르로 판정된 행 수 */
  matched: number;
  created: { id: number; title: string; url: string }[];
  updated: { id: number; title: string; url: string }[];
  /** 직접 등록본(또는 다른 수집본)과 같은 대회라 새로 만들지 않고 붙인 것 */
  merged: { id: number; title: string; url: string }[];
  skipped: { title: string; url: string; reason: string }[];
  failed: { title: string; url: string; reason: string }[];
  elapsedMs: number;
}

/**
 * contest.co.kr 음악경연 목록에서 콩쿠르를 모아 competitions 에 넣는다 (source CRAWL, 바로 게시).
 * 원문 URL(source_url)로 같은 공고를 찾아 있으면 일정·포스터만 갱신, 없으면 새로 만든다.
 * 주최 측이 직접 등록한 공고(OWNER)와의 병합은 나중 일 — 지금은 원문 URL 만으로 중복을 막는다.
 */
@Injectable()
export class ContestCompetitionCrawler {
  private readonly logger = new Logger(ContestCompetitionCrawler.name);
  private readonly gateway: ContestNoticeGateway;

  constructor(
    client: ContestNoticeClient,
    private readonly repository: CompetitionRepository,
    private readonly images: CompetitionImageStore,
    @Optional() @Inject(CONTEST_NOTICE_GATEWAY) gateway?: ContestNoticeGateway,
  ) {
    this.gateway = gateway ?? client;
  }

  /**
   * limit 을 주면 목록 앞에서부터 그 개수만 본다 (관리자 수동 실행용, 최대 200 = 4페이지). 스케줄은 limit 없이 1페이지(50건).
   * 사이트가 50건/페이지(pg=N)라 limit 이 50을 넘으면 다음 페이지를 이어 읽고, 페이지가 50건 미만이면 끝으로 본다
   */
  async crawl(options: { limit?: number } = {}): Promise<CompetitionCrawlSummary> {
    const startedAt = Date.now();
    const posterId = await this.repository.findUserIdByEmail(CRAWL_POSTER_EMAIL);
    if (!posterId) this.logger.warn(`수집 등록 계정(${CRAWL_POSTER_EMAIL})이 없어 작성자 없이 저장합니다`);
    const rows = await this.collectRows(Math.min(options.limit && options.limit > 0 ? options.limit : CONTEST_LIST_PAGE_SIZE, CRAWL_MAX_LIMIT));
    const matched = rows.filter(row => isCompetitionTitle(row.title));
    const summary: CompetitionCrawlSummary = {
      source: 'contest',
      scanned: rows.length,
      matched: matched.length,
      created: [],
      updated: [],
      merged: [],
      skipped: [],
      failed: [],
      elapsedMs: 0,
    };
    this.logger.log(`contest.co.kr 목록 ${rows.length}건 중 콩쿠르 ${matched.length}건`);

    for (const row of matched) {
      try {
        const outcome = await this.save(row, posterId);
        if (outcome.kind === 'skipped') summary.skipped.push({ title: row.title, url: row.url, reason: outcome.reason });
        else
          (outcome.kind === 'created' ? summary.created : outcome.kind === 'merged' ? summary.merged : summary.updated).push({
            id: outcome.id,
            title: row.title,
            url: row.url,
          });
      } catch (e) {
        const reason = e instanceof Error ? e.message : String(e);
        this.logger.error(`콩쿠르 저장 실패: ${row.title} (${row.url}) — ${reason}`);
        summary.failed.push({ title: row.title, url: row.url, reason });
      }
    }
    summary.elapsedMs = Date.now() - startedAt;
    return summary;
  }

  /**
   * 목록을 앞에서부터 limit 건 모은다. 종료된 대회(대회종료)는 빼고, 한 페이지가 50건 미만이거나 살아 있는 행이 하나도 없으면 끝으로 본다.
   * 상단 '추천' 행은 매 페이지 반복될 수 있어 id 로 중복 제거
   */
  private async collectRows(limit: number): Promise<ContestListRow[]> {
    const rows: ContestListRow[] = [];
    const seen = new Set<string>();
    for (let page = 1; rows.length < limit; page++) {
      const pageRows = parseContestList(await this.gateway.fetchList(page));
      const active = pageRows.filter(row => !row.closed);
      active.forEach(row => seen.has(row.id) || (seen.add(row.id), rows.push(row)));
      if (pageRows.length < CONTEST_LIST_PAGE_SIZE || active.length === 0) break;
    }
    return rows.slice(0, limit);
  }

  private async save(
    row: ContestListRow,
    posterId: number | null,
  ): Promise<{ kind: 'created' | 'updated' | 'merged'; id: number } | { kind: 'skipped'; reason: string }> {
    const detail = parseContestDetail(await this.gateway.fetchDetail(row.id));
    if (!detail.openAt || !detail.closeAt) return { kind: 'skipped', reason: '접수기간을 읽지 못함' };

    const input: CompetitionWrite = {
      title: detail.title || row.title,
      host: row.host || detail.organizer || '주최 미상',
      organizer: detail.organizer && detail.organizer !== row.host ? detail.organizer : null,
      area: (detail.area || row.area || '전국').replace(/\(온라인\)/, ''),
      venue: detail.venue,
      divisions: inferDivisions(row.title, row.categories),
      ages: inferAges(row.title),
      openAt: detail.openAt,
      closeAt: detail.closeAt,
      heldAt: detail.heldAt,
      resultAt: null,
      fee: null,
      // 접수는 주최 쪽으로만: 홈페이지가 있으면 링크, 없고 이메일이 있으면 이메일, 둘 다 없으면 전화 등 문의. 원문 사이트로는 보내지 않는다
      applyMethod: detail.homepage ? 'LINK' : detail.email ? 'EMAIL' : 'CONTACT',
      applyLink: detail.homepage ?? null,
      tel: detail.tel,
      email: detail.email,
      prize: null,
      // 유의사항 → 본문 순으로 한 글로 (원 사이트의 '관리자 알림'은 그쪽 서비스 안내라 뺀다)
      description: [detail.caution, detail.bodyText].filter(Boolean).join('\n\n') || null,
      // 이미지는 우리 S3 로 복사 — 원 사이트에 묶이지 않게. 실패한 이미지는 뺀다
      posterUrl: detail.posterUrl ? await this.images.store(detail.posterUrl, row.id) : null,
      documentUrl: null,
      contentImages: await this.images.storeAll(detail.bodyImages, row.id),
    };
    // 1단계: 원문 URL. 이미 들어온 공고면 갱신(삭제됐으면 건너뜀, 직접 등록본에 붙은 URL 이면 합친 것으로)

    const known = await this.repository.findBySourceUrl(row.url);

    if (known?.deleted) return { kind: 'skipped', reason: `관리자가 삭제한 공고 (id ${known.id})` };

    if (known?.source === 'OWNER') return { kind: 'merged', id: known.id };

    if (!known) {
      // 2단계: 제목·주최 키 + 마감 ±3일. 직접 등록본이 있으면 거기에 붙이고, 다른 수집본이 있으면 새로 만들지 않는다

      const [dup] = await this.repository.findDuplicates(dedupeKey(input.title, input.host), input.closeAt);

      if (dup?.source === 'OWNER') {
        await this.repository.attachSource(dup.id, row.url, input.posterUrl);

        return { kind: 'merged', id: dup.id };
      }

      if (dup) return { kind: 'skipped', reason: `같은 대회가 이미 있음 (id ${dup.id}, ${dup.source_url ?? '원문 없음'})` };
    }

    const result = await this.repository.upsertCrawled(input, row.url, posterId);
    return { kind: result.created ? 'created' : 'updated', id: result.id };
  }
}
