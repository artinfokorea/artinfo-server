import { Inject, Injectable, Logger, Optional } from '@nestjs/common';
import { CompetitionRepository } from '../competition.repository';
import { CompetitionWrite } from '../competition.types';
import { ContestNoticeClient, ContestNoticeGateway } from './contest-notice.client';
import { ContestListRow, inferAges, inferDivisions, isCompetitionTitle, parseContestDetail, parseContestList } from './contest-notice.parser';

export const CONTEST_NOTICE_GATEWAY = 'CONTEST_NOTICE_GATEWAY';

export interface CompetitionCrawlSummary {
  source: 'contest';
  /** 목록에서 읽은 행 수 */
  scanned: number;
  /** 콩쿠르로 판정된 행 수 */
  matched: number;
  created: { id: number; title: string; url: string }[];
  updated: { id: number; title: string; url: string }[];
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
    @Optional() @Inject(CONTEST_NOTICE_GATEWAY) gateway?: ContestNoticeGateway,
  ) {
    this.gateway = gateway ?? client;
  }

  async crawl(): Promise<CompetitionCrawlSummary> {
    const startedAt = Date.now();
    const rows = parseContestList(await this.gateway.fetchList());
    const matched = rows.filter(row => isCompetitionTitle(row.title));
    const summary: CompetitionCrawlSummary = {
      source: 'contest',
      scanned: rows.length,
      matched: matched.length,
      created: [],
      updated: [],
      skipped: [],
      failed: [],
      elapsedMs: 0,
    };
    this.logger.log(`contest.co.kr 목록 ${rows.length}건 중 콩쿠르 ${matched.length}건`);

    for (const row of matched) {
      try {
        const outcome = await this.save(row);
        if (outcome.kind === 'skipped') summary.skipped.push({ title: row.title, url: row.url, reason: outcome.reason });
        else (outcome.kind === 'created' ? summary.created : summary.updated).push({ id: outcome.id, title: row.title, url: row.url });
      } catch (e) {
        const reason = e instanceof Error ? e.message : String(e);
        this.logger.error(`콩쿠르 저장 실패: ${row.title} (${row.url}) — ${reason}`);
        summary.failed.push({ title: row.title, url: row.url, reason });
      }
    }
    summary.elapsedMs = Date.now() - startedAt;
    return summary;
  }

  private async save(row: ContestListRow): Promise<{ kind: 'created' | 'updated'; id: number } | { kind: 'skipped'; reason: string }> {
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
      applyMethod: 'LINK',
      applyLink: row.url,
      tel: detail.tel,
      email: detail.email,
      prize: null,
      description: detail.notice,
      posterUrl: detail.posterUrl,
      documentUrl: null,
    };
    const result = await this.repository.upsertCrawled(input, row.url);
    return { kind: result.created ? 'created' : 'updated', id: result.id };
  }
}
