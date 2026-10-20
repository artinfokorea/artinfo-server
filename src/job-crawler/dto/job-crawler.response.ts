import { ApiProperty } from '@nestjs/swagger';
import { CrawlSummary, CrawledJob, SkippedNotice } from '../source/job-source';

export class CrawledJobResponse {
  @ApiProperty({ type: Number, description: '등록된 채용 id' }) jobId: number;
  @ApiProperty({ type: String }) title: string;
  @ApiProperty({ type: String, description: '원문 공고 URL' }) url: string;
  @ApiProperty({ type: String, description: '변환한 첨부 파일명' }) attachment: string;
  @ApiProperty({ type: Number, description: '이미지 페이지 수' }) pageCount: number;
  @ApiProperty({ type: [String], description: '본문에서 찾은 전공 코드' }) majors: string[];

  constructor(j: CrawledJob) {
    this.jobId = j.jobId;
    this.title = j.title;
    this.url = j.url;
    this.attachment = j.attachment;
    this.pageCount = j.pageCount;
    this.majors = j.majors;
  }
}

export class SkippedNoticeResponse {
  @ApiProperty({ type: String }) title: string;
  @ApiProperty({ type: String }) url: string;
  @ApiProperty({ type: String }) reason: string;

  constructor(s: SkippedNotice) {
    this.title = s.title;
    this.url = s.url;
    this.reason = s.reason;
  }
}

export class CrawlSummaryResponse {
  @ApiProperty({ type: String, description: '소스 키', example: 'mokpo' }) source: string;
  @ApiProperty({ type: String, description: '소스 이름', example: '목포시립예술단' }) sourceName: string;
  @ApiProperty({ type: Number, description: '그날 올라온 공고 수' }) scanned: number;
  @ApiProperty({ type: Number, description: '제목 조건에 맞은 공고 수' }) matched: number;
  @ApiProperty({ type: [CrawledJobResponse], description: '새로 등록한 채용' }) created: CrawledJobResponse[];
  @ApiProperty({ type: [SkippedNoticeResponse], description: '건너뛴 공고 (이미 등록됨 · 첨부 없음)' }) skipped: SkippedNoticeResponse[];
  @ApiProperty({ type: [SkippedNoticeResponse], description: '실패한 공고' }) failed: SkippedNoticeResponse[];
  @ApiProperty({ type: Number }) elapsedMs: number;
  @ApiProperty({ type: String, required: false, description: '소스 전체가 실패한 경우 이유' }) error?: string;

  constructor(s: CrawlSummary) {
    this.source = s.source;
    this.sourceName = s.sourceName;
    this.scanned = s.scanned;
    this.matched = s.matched;
    this.created = s.created.map(c => new CrawledJobResponse(c));
    this.skipped = s.skipped.map(x => new SkippedNoticeResponse(x));
    this.failed = s.failed.map(x => new SkippedNoticeResponse(x));
    this.elapsedMs = s.elapsedMs;
    this.error = s.error;
  }
}

export class JobCrawlerRunResponse {
  @ApiProperty({ type: String, description: '수집한 등록일' }) date: string;
  @ApiProperty({ type: Number, description: '전체 소스에서 새로 등록한 채용 수' }) createdCount: number;
  @ApiProperty({ type: [CrawlSummaryResponse], description: '소스별 결과' }) sources: CrawlSummaryResponse[];

  constructor(date: string, summaries: CrawlSummary[]) {
    this.date = date;
    this.createdCount = summaries.reduce((n, s) => n + s.created.length, 0);
    this.sources = summaries.map(s => new CrawlSummaryResponse(s));
  }
}
