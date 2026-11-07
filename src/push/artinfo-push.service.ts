import { Injectable, Logger } from '@nestjs/common';
import { ArtinfoPushRepository } from '@/push/artinfo-push.repository';

export interface NewJobPush {
  jobId: number;
  title: string;
  companyName: string;
  /** 등록한 회원 — 본인에게는 보내지 않는다 */
  authorUserId: number;
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
 * 발송은 항상 fire-and-forget — 실패해도 원래 요청(공고 등록)은 영향받지 않는다.
 */
@Injectable()
export class ArtinfoPushService {
  private readonly logger = new Logger(ArtinfoPushService.name);

  constructor(private readonly repository: ArtinfoPushRepository) {}

  /** 새 채용 공고 — 채용 알림을 켜 둔 회원 전원(등록자 제외)에게 */
  notifyNewJob(job: NewJobPush): void {
    void (async () => {
      const tokens = await this.repository.scanTokensForJobPush(job.authorUserId);
      await this.send(tokens, {
        title: '새 채용 공고',
        body: `${job.companyName} · ${job.title}`,
        data: { type: 'job', jobId: String(job.jobId) },
      });
    })().catch(error => this.logger.warn(`push notifyNewJob failed: ${error instanceof Error ? error.message : String(error)}`));
  }

  private async send(tokens: string[], message: PushMessage): Promise<void> {
    const unique = [...new Set(tokens)].filter(token => token.startsWith('ExponentPushToken['));
    if (unique.length === 0) return;

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
  }
}
