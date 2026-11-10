import { ApiProperty } from '@nestjs/swagger';
import { CompetitionRow } from '../competition.types';
import { CompetitionCrawlSummary } from '../crawler/contest-competition.crawler';

const dateString = (value: Date | string | null): string | null =>
  value === null ? null : value instanceof Date ? value.toISOString().slice(0, 10) : String(value).slice(0, 10);

/** 콩쿠르 공고 하나 — 전역 ResponseInterceptor 가 { code, message, item } 으로 감싼다 */
export class CompetitionResponse {
  @ApiProperty({ type: Number }) id: number;
  @ApiProperty({ type: String }) title: string;
  @ApiProperty({ type: String }) host: string;
  @ApiProperty({ type: String, nullable: true }) organizer: string | null;
  @ApiProperty({ type: String }) area: string;
  @ApiProperty({ type: String, nullable: true }) venue: string | null;
  @ApiProperty({ type: [String] }) divisions: string[];
  @ApiProperty({ type: [String] }) ages: string[];
  @ApiProperty({ type: String, description: 'YYYY-MM-DD' }) openAt: string;
  @ApiProperty({ type: String, description: 'YYYY-MM-DD' }) closeAt: string;
  @ApiProperty({ type: String, nullable: true }) heldAt: string | null;
  @ApiProperty({ type: String, nullable: true }) resultAt: string | null;
  @ApiProperty({ type: String, nullable: true }) fee: string | null;
  @ApiProperty({ type: String, description: 'LINK | EMAIL | POST' }) applyMethod: string;
  @ApiProperty({ type: String, nullable: true }) applyLink: string | null;
  @ApiProperty({ type: String, nullable: true }) tel: string | null;
  @ApiProperty({ type: String, nullable: true }) email: string | null;
  @ApiProperty({ type: String, nullable: true }) prize: string | null;
  @ApiProperty({ type: String, nullable: true }) description: string | null;
  @ApiProperty({ type: String, nullable: true }) posterUrl: string | null;
  @ApiProperty({ type: String, nullable: true }) documentUrl: string | null;
  @ApiProperty({ type: String, description: 'OWNER(직접 등록) | CRAWL(수집)' }) source: string;
  @ApiProperty({ type: String, nullable: true, description: '수집 공고의 원문 URL' }) sourceUrl: string | null;
  @ApiProperty({ type: String, description: 'REVIEW | PUBLISHED | HIDDEN' }) status: string;
  @ApiProperty({ type: Number, nullable: true, description: '등록자 회원 ID' }) authorId: number | null;
  @ApiProperty({ type: Boolean, description: '단체 인증 주최' }) verified: boolean;
  @ApiProperty({ type: Number }) viewCount: number;
  @ApiProperty({ type: String, description: 'UPCOMING | OPEN | SOON | JUDGING | CLOSED (한국 날짜 기준)' }) phase: string;
  @ApiProperty({ type: Number, description: '마감까지 남은 날 (음수면 지남)' }) dDay: number;
  @ApiProperty({ type: Number, description: '접수 시작까지 남은 날' }) openIn: number;
  @ApiProperty({ type: String }) createdAt: string;

  constructor(row: CompetitionRow) {
    this.id = row.id;
    this.title = row.title;
    this.host = row.host;
    this.organizer = row.organizer;
    this.area = row.area;
    this.venue = row.venue;
    this.divisions = row.divisions ?? [];
    this.ages = row.ages ?? [];
    this.openAt = dateString(row.open_at) as string;
    this.closeAt = dateString(row.close_at) as string;
    this.heldAt = dateString(row.held_at);
    this.resultAt = dateString(row.result_at);
    this.fee = row.fee;
    this.applyMethod = row.apply_method;
    this.applyLink = row.apply_link;
    this.tel = row.tel;
    this.email = row.email;
    this.prize = row.prize;
    this.description = row.description;
    this.posterUrl = row.poster_url;
    this.documentUrl = row.document_url;
    this.source = row.source;
    this.sourceUrl = row.source_url;
    this.status = row.status;
    this.authorId = row.user_id;
    this.verified = row.verified;
    this.viewCount = row.view_count;
    this.phase = row.phase;
    this.dDay = Number(row.d_day);
    this.openIn = Number(row.open_in);
    this.createdAt = row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at);
  }
}

export class CompetitionsResponse {
  @ApiProperty({ type: [CompetitionResponse] }) competitions: CompetitionResponse[];
  @ApiProperty({ type: Number }) totalCount: number;

  constructor(rows: CompetitionRow[], totalCount: number) {
    this.competitions = rows.map(row => new CompetitionResponse(row));
    this.totalCount = totalCount;
  }
}

export class CreateCompetitionResponse {
  @ApiProperty({ type: Number }) id: number;
  @ApiProperty({ type: String, description: 'REVIEW(검토 후 게시) | PUBLISHED(관리자 등록은 즉시 게시)' }) status: string;

  constructor(result: { id: number; status: string }) {
    this.id = result.id;
    this.status = result.status;
  }
}

export class CompetitionCrawlResponse {
  @ApiProperty({ type: String }) source: string;
  @ApiProperty({ type: Number }) scanned: number;
  @ApiProperty({ type: Number }) matched: number;
  @ApiProperty({ type: Number }) createdCount: number;
  @ApiProperty({ type: Number }) updatedCount: number;
  @ApiProperty({ type: Number }) elapsedMs: number;
  @ApiProperty({ type: Object, isArray: true }) created: { id: number; title: string; url: string }[];
  @ApiProperty({ type: Object, isArray: true }) updated: { id: number; title: string; url: string }[];
  @ApiProperty({ type: Object, isArray: true }) skipped: { title: string; url: string; reason: string }[];
  @ApiProperty({ type: Object, isArray: true }) failed: { title: string; url: string; reason: string }[];

  constructor(summary: CompetitionCrawlSummary) {
    this.source = summary.source;
    this.scanned = summary.scanned;
    this.matched = summary.matched;
    this.createdCount = summary.created.length;
    this.updatedCount = summary.updated.length;
    this.elapsedMs = summary.elapsedMs;
    this.created = summary.created;
    this.updated = summary.updated;
    this.skipped = summary.skipped;
    this.failed = summary.failed;
  }
}
