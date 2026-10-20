const env = (key: string, fallback: string): string => process.env[key] ?? fallback;

/** 채용 공고 크롤러 설정. 모두 환경 변수로 바꿀 수 있다. */
export const jobCrawlerConfig = {
  /** 수집한 채용을 등록할 계정 (공연 스크랩과 같은 운영 계정) */
  posterEmail: env('JOB_CRAWLER_POSTER_EMAIL', 'artinfokorea2022@gmail.com'),
  userAgent: env('JOB_CRAWLER_USER_AGENT', 'Mozilla/5.0 (compatible; ArtinfoBot/1.0; +https://www.artinfokorea.com)'),
  httpTimeoutMs: Number(env('JOB_CRAWLER_HTTP_TIMEOUT_MS', '30000')),
  /** 공고문 이미지 배율·품질 (document-converter 와 같은 의미) */
  imageScale: Number(env('JOB_CRAWLER_IMAGE_SCALE', '2')),
  imageQuality: Number(env('JOB_CRAWLER_IMAGE_QUALITY', '80')),
  mokpo: {
    listUrl: 'https://www.mokpo.go.kr/www/mokpo_news/notification/public_notice',
    downloadUrl: 'https://eminwon.mokpo.go.kr/emwp/jsp/ofr/FileDownNew.jsp',
    /** 목록은 등록일 내림차순 15건씩. 하루치가 이보다 많을 수 있어 날짜가 지날 때까지 넘긴다 */
    maxListPages: Number(env('JOB_CRAWLER_MOKPO_MAX_PAGES', '10')),
    /** 제목에 모두 들어 있어야 하는 낱말 (공백 제거 후 비교) */
    titleKeywords: ['목포시립예술단', '채용'],
    companyName: '목포시립예술단',
    /** 단체 주소. JobRepository 가 첫 어절을 provinces.name 과 맞춰 지역을 매긴다 */
    address: '전남광주통합특별시 목포시 양을로 203',
    addressDetail: '목포시청 3층 문화예술과',
    /** src/job-crawler/assets 의 로고 — 채용 대표 이미지(imageUrl) */
    logoAsset: 'mokpo.png',
  },
};

/** 한국 시간 기준 오늘 (YYYY-MM-DD) */
export function todayInKst(now: Date = new Date()): string {
  return now.toLocaleDateString('en-CA', { timeZone: 'Asia/Seoul' });
}
