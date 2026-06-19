// 대량 메일 발송 큐. 수신자 1명당 1개의 job으로 분할해 워커가 동시성·rate limit·재시도와 함께 처리한다.
export const ONCHURCH_BULK_EMAIL_QUEUE = 'onchurch-bulk-email';

export const ONCHURCH_BULK_EMAIL_MAIL_FROM = '온교회 <artinfokorea2022@gmail.com>';

// 수신자 1명 발송 job 데이터. 본문(html)은 1000건이 공유하므로 job마다 싣지 않고
// 워커가 logId로 1회만 조회·렌더해 캐시한다.
export interface OnchurchBulkEmailJob {
  logId: number;
  email: string;
  subject: string;
}
