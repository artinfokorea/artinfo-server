import { jobCrawlerConfig } from '../job-crawler.config';

/**
 * 제목 조건 한 항목. 문자열이면 그 낱말이 꼭 있어야 하고, 배열이면 그중 하나만 있으면 된다 (예: ['모집', '채용']).
 */
export type TitleKeyword = string | string[];

/**
 * 모든 소스에 공통인 제목 판정. 공백을 지운 뒤 비교한다.
 * - required: 소스가 정한 항목이 모두 맞아야 한다 (예: 목포시립예술단 · 채용, 시립교향악단 · (모집|채용))
 * - 전역 제외 낱말(jobCrawlerConfig.excludedTitleKeywords, 예: 합격)이 하나라도 들어 있으면 제외 — 합격자 발표 등 채용 공고가 아닌 글
 */
export function isRecruitmentTitle(title: string, required: TitleKeyword[]): boolean {
  const compact = title.replace(/\s+/g, '');
  if (jobCrawlerConfig.excludedTitleKeywords.some(keyword => compact.includes(keyword))) return false;
  return required.every(keyword => (Array.isArray(keyword) ? keyword.some(k => compact.includes(k)) : compact.includes(keyword)));
}
