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
  boryeong: {
    /** 보령문화예술회관 공지사항 (전자정부 게시판, 시립합창단 모집이 여기 올라온다). 목록 ?bbsId=&pageIndex=N, 상세 selectBoardArticle.do?bbsId=&nttId= */
    listUrl: 'https://www.brcn.go.kr/cop/bbs/BBSMSTR_000000000983/selectBoardList.do',
    bbsId: 'BBSMSTR_000000000983',
    /** 첨부 다운로드 /cmm/fms/FileDown.do?atchFileId=&fileSn= — 쿠키·Referer 없이 받을 수 있다 */
    downloadUrl: 'https://www.brcn.go.kr/cmm/fms/FileDown.do',
    /** 목록은 고정 공지 5건 + 등록일 내림차순 10건씩. 날짜가 지날 때까지 넘긴다 */
    maxListPages: Number(env('JOB_CRAWLER_BORYEONG_MAX_PAGES', '10')),
    /** 제목 조건: '보령시립합창단' 과 '모집' 또는 '채용' (소년소녀합창단 정기연주회·합격자 알림은 제외) */
    titleKeywords: ['보령시립합창단', ['모집', '채용']] as (string | string[])[],
    companyName: '보령시립합창단',
    address: '충남 보령시 성주산로 101',
    addressDetail: '보령문화예술회관',
    /** 채용 대표 이미지 URL. 비어 있으면 imageFile(보령시 로고)을 기동 후 첫 등록 때 S3 에 올려 쓴다 */
    imageUrl: env('JOB_CRAWLER_BORYEONG_IMAGE_URL', ''),
    imageFile: 'assets/job-crawler/boryeong.png',
  },
  seosan: {
    /**
     * 서산시 공고/고시(contents.do?key=1258) + 채용공고(key=5309). 그 페이지들은 eminwon 목록을 iframe 으로 끼우므로
     * iframe 주소를 바로 읽는다: eminwonView.jsp + listParams + pageIndex=N. 상세는 not_ancmt_mgt_no=, 첨부는 eminwon.seosan.go.kr FileDown.jsp GET
     */
    viewUrl: 'https://www.seosan.go.kr/common/program/eminwonView.jsp',
    listParams: {
      jndinm: 'OfrNotAncmtEJB',
      context: 'NTIS',
      method: 'selectListOfrNotAncmt',
      methodnm: 'selectListOfrNotAncmtHomepage',
      homepage_pbs_yn: 'Y',
      subCheck: 'Y',
      ofr_pageSize: '10',
      /**
       * 고시공고 구분: 01·04·06 = 누리집 '공고/고시'(contents.do?key=1258), 05 = '채용공고'(key=5309).
       * 시립합창단 단원 모집은 채용공고가 아니라 일반 공고(key=1258)로 올라오기도 하므로 둘 다 읽는다
       */
      not_ancmt_se_code: '01,04,05,06',
      countYn: 'Y',
      list_gubun: 'A',
      mobile_code: '00',
      Key: 'B_Subject',
    },
    /** 목록은 등록일 내림차순 10건씩. 날짜가 지날 때까지 넘긴다 */
    maxListPages: Number(env('JOB_CRAWLER_SEOSAN_MAX_PAGES', '10')),
    /** 제목 조건: '시립합창단'('서산시 시립합창단'·'서산시립합창단' 모두) 과 '모집' 또는 '채용' (합격자 공고는 전역 제외) */
    titleKeywords: ['시립합창단', ['모집', '채용']] as (string | string[])[],
    companyName: '서산시립합창단',
    address: '충남 서산시 부춘공원2로 11',
    addressDetail: '서산시립합창단',
    /** 채용 대표 이미지 URL. 비어 있으면 imageFile(서산시 로고)을 기동 후 첫 등록 때 S3 에 올려 쓴다 */
    imageUrl: env('JOB_CRAWLER_SEOSAN_IMAGE_URL', ''),
    imageFile: 'assets/job-crawler/seosan.png',
  },
  bucheon: {
    /**
     * 부천시립예술단 누리집. 공지사항(/front/M0000025/article) 과 단원채용(/front/M0000061/recruit) 두 게시판을 모두 읽는다
     * (게시판 경로는 bucheon-notice.parser 의 BUCHEON_BOARDS). 목록·상세는 GET, 첨부 /file/download.do 는 상세 URL 을 Referer 로 보내야 받는다.
     * 공고문은 ZIP 으로 묶여 올라오거나 본문에 이미지로 들어 있어, 크롤러가 ZIP 안 공고문 → 본문 이미지 순으로 고른다
     */
    origin: 'https://www.bucheonphil.or.kr',
    /** 두 게시판 모두 등록일 내림차순 10건씩. 날짜가 지날 때까지 넘긴다 */
    maxListPages: Number(env('JOB_CRAWLER_BUCHEON_MAX_PAGES', '10')),
    /** 제목 조건: '부천시립합창단' 과 '모집' 또는 '채용' (앵콜곡 안내 · 작품 공모 · 합격자 공고는 제외) */
    titleKeywords: ['부천시립합창단', ['모집', '채용']] as (string | string[])[],
    companyName: '부천시립합창단',
    address: '경기 부천시 원미구 소향로 165',
    addressDetail: '부천시립예술단',
    /** 채용 대표 이미지 URL. 비어 있으면 imageFile(부천시립합창단 로고)을 기동 후 첫 등록 때 S3 에 올려 쓴다 */
    imageUrl: env('JOB_CRAWLER_BUCHEON_IMAGE_URL', ''),
    imageFile: 'assets/job-crawler/bucheon.png',
  },
  incheon: {
    /**
     * 인천문화예술회관 누리집 채용/공모 게시판 (시립예술단 단원 모집이 여기 올라온다).
     * 목록 /art/ART040102?curPage=N (고정 공지는 1페이지에만 + 작성일 내림차순 10건), 상세 /art/ART040102/{id},
     * 첨부 /comm/getFile?srvcId=&upperNo=&fileTy=ATTACH&fileNo= GET — 쿠키·Referer 없이 받을 수 있다
     */
    origin: 'https://www.incheon.go.kr',
    boardPath: '/art/ART040102',
    /** 목록은 작성일 내림차순 10건씩. 날짜가 지날 때까지 넘긴다 */
    maxListPages: Number(env('JOB_CRAWLER_INCHEON_MAX_PAGES', '10')),
    /** 제목 조건: '인천시립교향악단' 과 '모집' 또는 '채용' (청소년교향악단·합창단·무용단 단독 공고, 공무직·안내원 채용은 제외) */
    titleKeywords: ['인천시립교향악단', ['모집', '채용']] as (string | string[])[],
    /** 같은 모집의 전형 단계 안내('… 공개모집 1차 실기전형 공고', '1차 결과 및 2차 안내')는 새 채용이 아니다 (합격자 공고는 전역 제외) */
    excludedTitleKeywords: ['1차', '2차', '3차', '결과'],
    companyName: '인천시립교향악단',
    address: '인천 남동구 예술로 149',
    addressDetail: '인천시립교향악단',
    /** 채용 대표 이미지 URL. 비어 있으면 imageFile(인천시립교향악단 로고)을 기동 후 첫 등록 때 S3 에 올려 쓴다 */
    imageUrl: env('JOB_CRAWLER_INCHEON_IMAGE_URL', ''),
    imageFile: 'assets/job-crawler/incheon.png',
  },
  gimcheon: {
    /**
     * 김천시문화예술회관 공지사항 (eGov 게시판 — 시립예술단 단원·지휘자 모집이 여기 올라온다).
     * 목록 /gcart/bbs/list.do?searchCategory=gcart&ptIdx=1807&mId=0601000000&page=N (작성일 내림차순 10건),
     * 상세 /gcart/bbs/view.do?bIdx=, 첨부 /cmm/fms/FileDown.do?atchFileId=&fileSn= GET — 쿠키·Referer 없이 받을 수 있다
     */
    origin: 'https://www.gc.go.kr',
    listPath: '/gcart/bbs/list.do',
    board: { searchCategory: 'gcart', ptIdx: '1807', mId: '0601000000' },
    maxListPages: Number(env('JOB_CRAWLER_GIMCHEON_MAX_PAGES', '10')),
    /** 제목 조건: '시립예술단' 과 '모집' 또는 '채용' ("2024 시립예술단(비상임) 신규 단원 모집" 처럼 '김천' 을 뺀 제목도 있다. 예술아카데미 수강생 모집·공연 안내·회관 기간제근로자 채용은 제외) */
    titleKeywords: ['시립예술단', ['모집', '채용']] as (string | string[])[],
    /** 전형 단계·일정 안내 공고는 새 채용이 아니다 (합격자 공고는 전역 제외) */
    excludedTitleKeywords: ['1차', '2차', '3차', '결과', '면접', '공연일정'],
    companyName: '김천시립예술단',
    address: '경북 김천시 다삼로 3',
    addressDetail: '3',
    /** 채용 대표 이미지 URL. 비어 있으면 imageFile(김천시 로고)을 기동 후 첫 등록 때 S3 에 올려 쓴다 */
    imageUrl: env('JOB_CRAWLER_GIMCHEON_IMAGE_URL', ''),
    imageFile: 'assets/job-crawler/gimcheon.png',
  },
};

/** 한국 시간 기준 오늘 (YYYY-MM-DD) */
export function todayInKst(now: Date = new Date()): string {
  return now.toLocaleDateString('en-CA', { timeZone: 'Asia/Seoul' });
}
