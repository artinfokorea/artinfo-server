import { Inject, Injectable, Logger } from '@nestjs/common';
import { IOngiPushTokenRepository, ONGI_PUSH_TOKEN_REPOSITORY } from '@/ongi/push/domain/repository/ongi-push-token.repository.interface';
import { IOngiMemberRepository, ONGI_MEMBER_REPOSITORY } from '@/ongi/group/domain/repository/ongi-member.repository.interface';
import { IOngiBlockRepository, ONGI_BLOCK_REPOSITORY } from '@/ongi/group/domain/repository/ongi-block.repository.interface';

export interface OngiPushMessage {
  title: string;
  body: string;
  /** 앱이 탭 시 이동에 쓰는 페이로드 (groupId, photoId 등) */
  data?: Record<string, string>;
}

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';
const CHUNK = 100;

/**
 * Expo Push API 로 발송. APNs 키는 EAS 프로젝트에 등록돼 있어 서버는 Expo 서비스만 호출하면 된다.
 * 발송은 항상 fire-and-forget — 실패해도 원래 요청(업로드 등)은 영향받지 않는다.
 */
@Injectable()
export class OngiPushService {
  private readonly logger = new Logger(OngiPushService.name);

  constructor(
    @Inject(ONGI_PUSH_TOKEN_REPOSITORY)
    private readonly pushTokenRepository: IOngiPushTokenRepository,

    @Inject(ONGI_MEMBER_REPOSITORY)
    private readonly memberRepository: IOngiMemberRepository,

    @Inject(ONGI_BLOCK_REPOSITORY)
    private readonly blockRepository: IOngiBlockRepository,
  ) {}

  /** 그룹 구성원 전원(제외 사용자 빼고)에게 발송. 발신자를 차단한 사용자에게는 보내지 않는다 */
  notifyGroup(groupId: number, senderUserId: number, message: OngiPushMessage): void {
    void this.notifyGroupInternal(groupId, senderUserId, message).catch(error =>
      this.logger.warn(`push notifyGroup failed: ${error instanceof Error ? error.message : String(error)}`),
    );
  }

  private async notifyGroupInternal(groupId: number, senderUserId: number, message: OngiPushMessage): Promise<void> {
    const members = await this.memberRepository.scanByGroupId(groupId);
    const candidates = members.map(m => m.userId).filter(id => id !== senderUserId);
    if (candidates.length === 0) return;

    // 발신자를 차단한 사용자는 제외
    const recipients: number[] = [];
    for (const userId of candidates) {
      const blocked = await this.blockRepository.blockedUserIdsOf(userId);
      if (!blocked.includes(senderUserId)) recipients.push(userId);
    }

    const tokens = await this.pushTokenRepository.scanByUserIds(recipients);
    await this.send(
      tokens.map(t => t.token),
      message,
    );
  }

  private async send(tokens: string[], message: OngiPushMessage): Promise<void> {
    const unique = [...new Set(tokens)].filter(t => t.startsWith('ExponentPushToken['));
    if (unique.length === 0) return;

    const stale: string[] = [];
    for (let i = 0; i < unique.length; i += CHUNK) {
      const chunk = unique.slice(i, i + CHUNK);
      const response = await fetch(EXPO_PUSH_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(chunk.map(to => ({ to, title: message.title, body: message.body, data: message.data ?? {}, sound: 'default' }))),
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
    if (stale.length > 0) await this.pushTokenRepository.deleteByTokens(stale);
  }
}
