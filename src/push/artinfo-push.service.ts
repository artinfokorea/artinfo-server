import { Injectable, Logger } from '@nestjs/common';
import { ArtinfoPushRepository } from '@/push/artinfo-push.repository';

export type PushTarget = 'ADMIN' | 'ALL';

export interface JobDigestResult {
  /** 집계된 새 채용 공고 수 — 스케줄 발송은 0 이면 보내지 않는다 */
  jobCount: number;
  /** 발송 요청한 기기 수 (중복·형식 오류 제외) */
  sent: number;
}

interface PushMessage {
  title: string;
  body: string;
  /** 앱이 탭 시 이동에 쓰는 페이로드 */
  data: Record<string, string>;
}

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';
const CHUNK = 100;

/**
 * Expo Push API 로 발송 (온기와 같은 방식). APNs 키는 EAS 프로젝트에 등록돼 있어 서버는 Expo 서비스만 호출한다.
 * - 채용 요약: 매일 12:00 KST 스케줄러가 호출. 어제(한국 날짜) 등록된 공고 수를 보내고, 없으면 보내지 않는다
 *   (크롤러가 매일 23:00 KST 에 모은 공고가 다음날 점심 요약에 들어간다).
 * - 테스트: 관리자 API 가 같은 채용 요약 메시지를 관리자 기기 또는 전체에 보낸다 (0건이어도 전달 확인용으로 보낸다).
 */
@Injectable()
export class ArtinfoPushService {
  private readonly logger = new Logger(ArtinfoPushService.name);

  constructor(private readonly repository: ArtinfoPushRepository) {}

  /** 어제 등록된 채용 공고 요약 — 채용 알림을 켜 둔 회원 전원에게. 0건이면 발송하지 않는다 */
  async sendJobDigest(): Promise<JobDigestResult> {
    const jobCount = await this.repository.countJobsCreatedYesterday();
    if (jobCount === 0) {
      this.logger.log('채용 요약 푸시: 새 공고 없음 — 보내지 않음');
      return { jobCount, sent: 0 };
    }
    const tokens = await this.repository.scanJobPushTokens();
    const sent = await this.send(tokens, this.buildJobDigestMessage(jobCount));
    this.logger.log(`채용 요약 푸시: 공고 ${jobCount}건, 기기 ${sent}대`);
    return { jobCount, sent };
  }

  /**
   * 관리자 테스트 — 스케줄과 똑같은 채용 요약 메시지를 지금 보낸다.
   * ADMIN: 관리자 계정 기기만(수신 설정 무시), ALL: 실제 발송 대상과 같은 채용 알림 켜 둔 회원 전원.
   * 전달 자체를 확인하는 용도라 새 공고 0건이어도 보낸다.
   */
  async sendJobDigestTest(target: PushTarget): Promise<JobDigestResult> {
    const jobCount = await this.repository.countJobsCreatedYesterday();
    const tokens = target === 'ADMIN' ? await this.repository.scanAdminTokens() : await this.repository.scanJobPushTokens();
    const sent = await this.send(tokens, this.buildJobDigestMessage(jobCount));
    this.logger.log(`채용 요약 푸시 테스트(${target}): 공고 ${jobCount}건, 기기 ${sent}대`);
    return { jobCount, sent };
  }

  /** 스케줄·테스트가 같은 문구를 쓴다 — 앱은 data.type 'jobs' 로 채용 탭을 연다 */
  private buildJobDigestMessage(jobCount: number): PushMessage {
    return {
      title: '새로 올라온 채용 공고',
      body: jobCount > 0 ? `어제 새로 등록된 채용 공고 ${jobCount}건을 확인해 보세요.` : '어제 새로 등록된 채용 공고가 없어요.',
      data: { type: 'jobs' },
    };
  }

  /** 발송 요청한 기기 수를 돌려준다 */
  private async send(tokens: string[], message: PushMessage): Promise<number> {
    const unique = [...new Set(tokens)].filter(token => token.startsWith('ExponentPushToken['));
    if (unique.length === 0) return 0;

    const stale: string[] = [];
    for (let i = 0; i < unique.length; i += CHUNK) {
      const chunk = unique.slice(i, i + CHUNK);
      const response = await fetch(EXPO_PUSH_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(chunk.map(to => ({ to, title: message.title, body: message.body, data: message.data, sound: 'default' }))),
      });
      if (!response.ok) {
        this.logger.warn(`expo push http ${response.status}`);
        continue;
      }
      const payload = (await response.json()) as { data?: { status: string; details?: { error?: string } }[] };
      payload.data?.forEach((ticket, index) => {
        if (ticket.status === 'error' && ticket.details?.error === 'DeviceNotRegistered') stale.push(chunk[index]);
      });
    }

    // 앱 삭제 등으로 죽은 토큰은 정리
    if (stale.length > 0) await this.repository.deleteTokens(stale);
    return unique.length;
  }
}
