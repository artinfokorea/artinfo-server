import { ApiProperty } from '@nestjs/swagger';
import { CrawlSummary, CrawledJob, SkippedNotice } from '../mokpo/mokpo-art-job.crawler';

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

export class JobCrawlerRunResponse {
  @ApiProperty({ type: String, example: 'mokpo' }) source: string;
  @ApiProperty({ type: String, description: '수집한 등록일' }) date: string;
  @ApiProperty({ type: Number, description: '그날 올라온 공고 수' }) scanned: number;
  @ApiProperty({ type: Number, description: '제목 조건에 맞은 공고 수' }) matched: number;
  @ApiProperty({ type: [CrawledJobResponse], description: '새로 등록한 채용' }) created: CrawledJobResponse[];
  @ApiProperty({ type: [SkippedNoticeResponse], description: '건너뛴 공고 (이미 등록됨 · 첨부 없음)' }) skipped: SkippedNoticeResponse[];
  @ApiProperty({ type: [SkippedNoticeResponse], description: '실패한 공고' }) failed: SkippedNoticeResponse[];
  @ApiProperty({ type: Number }) elapsedMs: number;

  constructor(s: CrawlSummary) {
    this.source = s.source;
    this.date = s.date;
    this.scanned = s.scanned;
    this.matched = s.matched;
    this.created = s.created.map(c => new CrawledJobResponse(c));
    this.skipped = s.skipped.map(x => new SkippedNoticeResponse(x));
    this.failed = s.failed.map(x => new SkippedNoticeResponse(x));
    this.elapsedMs = s.elapsedMs;
  }
}
