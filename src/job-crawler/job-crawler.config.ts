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
  /** 모든 소스 공통 — 제목에 이 낱말이 있으면 채용 공고로 보지 않는다 (합격자 발표 등). 공백 제거 후 비교 */
  excludedTitleKeywords: ['합격'],
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
    /** 채용 대표 이미지 (이미 S3 에 올라가 있는 목포시 로고) */
    imageUrl: env(
      'JOB_CRAWLER_MOKPO_IMAGE_URL',
      'https://artinfo.s3.ap-northeast-2.amazonaws.com/prod/upload/4637/images/20261020/original/cLa2DrY-gIr.1792501357272.png',
    ),
  },
  ulsan: {
    /** 울산문화예술회관 공지사항 (시립예술단 공고가 여기 올라온다). 목록 ?mnu_code=&pageNo=N, 상세 &bod_sn=&cmd=2 */
    pageUrl: 'https://www.ulsan.go.kr/ucac/art/page.do',
    menuCode: 'mnu003001',
    /** 첨부 다운로드 — 상세 페이지의 세션 쿠키가 없으면 "조회 권한이 없습니다" HTML 이 온다 */
    downloadUrl: 'https://www.ulsan.go.kr/ucac/board_download.do',
    /** 목록은 고정 공지 5건 + 등록일 내림차순 10건씩. 날짜가 지날 때까지 넘긴다 */
    maxListPages: Number(env('JOB_CRAWLER_ULSAN_MAX_PAGES', '10')),
    /** 제목 조건: '시립교향악단'(울산시립·울산광역시립 모두, 청소년교향악단은 제외) 과 '모집' 또는 '채용' */
    titleKeywords: ['시립교향악단', ['모집', '채용']] as (string | string[])[],
    companyName: '울산시립교향악단',
    address: '울산 남구 번영로 200',
    addressDetail: '울산문화예술회관 시립교향악단',
    /** 채용 대표 이미지 (이미 S3 에 올라가 있는 울산시립교향악단 로고) */
    imageUrl: env(
      'JOB_CRAWLER_ULSAN_IMAGE_URL',
      'https://artinfo.s3.ap-northeast-2.amazonaws.com/prod/upload/4637/images/20261024/original/0T1newl6ktY.1792829663169.png',
    ),
  },
};

/** 한국 시간 기준 오늘 (YYYY-MM-DD) */
export function todayInKst(now: Date = new Date()): string {
  return now.toLocaleDateString('en-CA', { timeZone: 'Asia/Seoul' });
}
