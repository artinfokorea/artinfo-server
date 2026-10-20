/** 수집 소스(기관) 하나. 새 기관을 붙일 때 이 인터페이스로 구현해 JOB_SOURCE_CRAWLERS 에 등록한다. */
export interface JobSourceCrawler {
  /** API 의 source 쿼리·요약의 키 (영문 소문자) */
  readonly key: string;
  /** 사람이 읽는 이름 */
  readonly name: string;
  /** 그 날짜(YYYY-MM-DD, KST)에 올라온 공고를 수집·등록한다 */
  crawl(date: string): Promise<CrawlSummary>;
}

export const JOB_SOURCE_CRAWLERS = 'JOB_SOURCE_CRAWLERS';

export interface CrawledJob {
  jobId: number;
  title: string;
  url: string;
  attachment: string;
  pageCount: number;
  majors: string[];
}

export interface SkippedNotice {
  title: string;
  url: string;
  reason: string;
}

export interface CrawlSummary {
  source: string;
  sourceName: string;
  date: string;
  /** 목록에서 읽은 그날 공고 수 */
  scanned: number;
  /** 제목 조건에 맞은 공고 수 */
  matched: number;
  created: CrawledJob[];
  skipped: SkippedNotice[];
  failed: SkippedNotice[];
  elapsedMs: number;
  /** 소스 전체가 실패했을 때 (목록을 못 읽는 등) */
  error?: string;
}

export function emptySummary(source: JobSourceCrawler, date: string): CrawlSummary {
  return { source: source.key, sourceName: source.name, date, scanned: 0, matched: 0, created: [], skipped: [], failed: [], elapsedMs: 0 };
}
