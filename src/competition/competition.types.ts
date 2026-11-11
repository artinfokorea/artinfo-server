/** 접수 상태 — DB 의 한국 날짜 기준으로 계산한다 (SOON 은 OPEN 중 마감 7일 이내) */
export type CompetitionPhase = 'UPCOMING' | 'OPEN' | 'SOON' | 'JUDGING' | 'CLOSED';
export const COMPETITION_PHASES: CompetitionPhase[] = ['UPCOMING', 'OPEN', 'SOON', 'JUDGING', 'CLOSED'];

/** 게시 상태 — REVIEW 는 등록자(와 관리자)에게만 보인다 */
export type CompetitionStatus = 'REVIEW' | 'PUBLISHED' | 'HIDDEN';
export type CompetitionSource = 'OWNER' | 'CRAWL';
export type ApplyMethod = 'LINK' | 'EMAIL' | 'POST';
export const APPLY_METHODS: ApplyMethod[] = ['LINK', 'EMAIL', 'POST'];

export interface CompetitionRow {
  id: number;
  title: string;
  host: string;
  organizer: string | null;
  area: string;
  venue: string | null;
  divisions: string[];
  ages: string[];
  /** pg 드라이버는 DATE 를 Date 로 돌려주기도 한다 — 응답에서 YYYY-MM-DD 로 맞춘다 */
  open_at: Date | string;
  close_at: Date | string;
  held_at: Date | string | null;
  result_at: Date | string | null;
  fee: string | null;
  apply_method: ApplyMethod;
  apply_link: string | null;
  tel: string | null;
  email: string | null;
  prize: string | null;
  description: string | null;
  poster_url: string | null;
  document_url: string | null;
  /** 본문 이미지(공고문·요강 그림) — 포스터와 별개로 여러 장 */
  content_images: string[];
  source: CompetitionSource;
  source_url: string | null;
  status: CompetitionStatus;
  user_id: number | null;
  verified: boolean;
  view_count: number;
  created_at: Date | string;
  updated_at: Date | string;
  phase: CompetitionPhase;
  /** 마감까지 남은 날 (음수면 지남) */
  d_day: number;
  /** 접수 시작까지 남은 날 */
  open_in: number;
  total_count?: number | string;
}

export interface CompetitionWrite {
  title: string;
  host: string;
  organizer: string | null;
  area: string;
  venue: string | null;
  divisions: string[];
  ages: string[];
  openAt: string;
  closeAt: string;
  heldAt: string | null;
  resultAt: string | null;
  fee: string | null;
  applyMethod: ApplyMethod;
  applyLink: string | null;
  tel: string | null;
  email: string | null;
  prize: string | null;
  description: string | null;
  posterUrl: string | null;
  documentUrl: string | null;
  contentImages: string[];
}

export interface CompetitionListFilter {
  page: number;
  size: number;
  keyword: string | null;
  phases: CompetitionPhase[];
  divisions: string[];
  areas: string[];
}
