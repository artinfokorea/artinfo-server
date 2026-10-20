import { jobCrawlerConfig } from '../job-crawler.config';

/**
 * 모든 소스에 공통인 제목 판정. 공백을 지운 뒤 비교한다.
 * - required: 소스가 정한 낱말이 모두 들어 있어야 한다 (예: 목포시립예술단 · 채용)
 * - 전역 제외 낱말(jobCrawlerConfig.excludedTitleKeywords, 예: 합격)이 하나라도 들어 있으면 제외 — 합격자 발표 등 채용 공고가 아닌 글
 */
export function isRecruitmentTitle(title: string, required: string[]): boolean {
  const compact = title.replace(/\s+/g, '');
  if (jobCrawlerConfig.excludedTitleKeywords.some(keyword => compact.includes(keyword))) return false;
  return required.every(keyword => compact.includes(keyword));
}
