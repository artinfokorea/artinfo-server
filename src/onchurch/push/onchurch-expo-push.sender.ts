import { Injectable, Logger } from '@nestjs/common';
import type { PushMessage } from '@/onchurch/push/onchurch-push.service';

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';
const CHUNK = 100;

/**
 * Expo Push API 발송 (아트인포 ArtinfoPushService 와 같은 방식).
 * APNs 키·FCM 키는 EAS 프로젝트에 등록돼 있어야 하고, 서버는 Expo 서비스만 호출한다.
 */
@Injectable()
export class OnchurchExpoPushSender {
  private readonly logger = new Logger(OnchurchExpoPushSender.name);

  /** 보낸 기기 수와, 앱 삭제 등으로 죽은 토큰(DeviceNotRegistered)을 돌려준다 */
  async send(tokens: string[], message: PushMessage): Promise<{ sent: number; stale: string[] }> {
    const unique = [...new Set(tokens)].filter(token => token.startsWith('ExponentPushToken['));
    if (unique.length === 0) return { sent: 0, stale: [] };

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
    return { sent: unique.length, stale };
  }
}
