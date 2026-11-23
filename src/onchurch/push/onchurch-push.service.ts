import { Injectable, Logger } from '@nestjs/common';
import { OnchurchPushRepository } from '@/onchurch/push/onchurch-push.repository';
import { OnchurchExpoPushSender } from '@/onchurch/push/onchurch-expo-push.sender';

export interface PushMessage {
  title: string;
  body: string;
  /** 앱이 알림을 탭했을 때 쓰는 값 — path 는 교회 홈페이지 안의 경로 */
  data: { type: string; path: string };
}

/** 관리자가 올리는 글 종류 */
export type ChurchPostKind = 'notice' | 'sermon' | 'gallery';

const CHURCH_POST: Record<ChurchPostKind, { label: string; path: string }> = {
  notice: { label: '공지', path: '/notices' },
  sermon: { label: '설교', path: '/sermons' },
  gallery: { label: '앨범', path: '/gallery' },
};

const MAX_TEXT = 80;
const DEFAULT_TITLE = '온교회';

const clip = (text: string): string => {
  const flat = text.replace(/\s+/g, ' ').trim();
  return flat.length > MAX_TEXT ? `${flat.slice(0, MAX_TEXT)}…` : flat;
};

/**
 * 온교회 앱 푸시.
 * - 관리자가 공지·설교·앨범을 올리면 → 작성자를 뺀 그 교회 사람들
 * - 성도가 교제 글을 쓰면 → 작성자를 뺀 그 교회 사람들
 * - 교제 글에 댓글이 달리면 → 글쓴이 (자기 글에 단 댓글은 제외)
 * 알림을 끈 사람, 작성자를 차단한 사람은 저장소 쿼리가 거른다.
 * 글 작성 흐름을 막지 않도록 어떤 실패도 예외로 던지지 않고 0 을 돌려준다.
 */
@Injectable()
export class OnchurchPushService {
  private readonly logger = new Logger(OnchurchPushService.name);

  constructor(
    private readonly repository: OnchurchPushRepository,
    private readonly sender: OnchurchExpoPushSender,
  ) {}

  async notifyChurchPost(params: {
    churchId: number;
    authorId: number;
    kind: ChurchPostKind;
    title: string;
    /** false 면 (숨김 글) 보내지 않는다 */
    isActive?: boolean;
    /** 예약 공지 — 게시 시각이 미래면 보내지 않는다 */
    publishedAt?: Date | null;
    now?: Date;
  }): Promise<number> {
    if (params.isActive === false) return 0;
    if (params.publishedAt && params.publishedAt.getTime() > (params.now ?? new Date()).getTime()) return 0;
    const { label, path } = CHURCH_POST[params.kind];
    return this.safely(async () => {
      const tokens = await this.repository.scanChurchTokens(params.churchId, params.authorId);
      return this.deliver(tokens, {
        title: await this.churchTitle(params.churchId),
        body: `[${label}] ${clip(params.title)}`,
        data: { type: params.kind, path },
      });
    });
  }

  async notifyCommunityPost(params: { churchId: number; authorId: number; authorName: string; postId: number; title: string }): Promise<number> {
    return this.safely(async () => {
      const tokens = await this.repository.scanChurchTokens(params.churchId, params.authorId);
      return this.deliver(tokens, {
        title: await this.churchTitle(params.churchId),
        body: `${params.authorName}님이 교제 글을 올렸어요: ${clip(params.title)}`,
        data: { type: 'community', path: `/community?post=${params.postId}` },
      });
    });
  }

  async notifyCommunityComment(params: {
    churchId: number;
    postId: number;
    postAuthorId: number;
    commenterId: number;
    commenterName: string;
    content: string;
  }): Promise<number> {
    if (params.postAuthorId === params.commenterId) return 0;
    return this.safely(async () => {
      const tokens = await this.repository.scanUserTokens(params.postAuthorId, params.commenterId);
      return this.deliver(tokens, {
        title: await this.churchTitle(params.churchId),
        body: `${params.commenterName}님이 댓글을 남겼어요: ${clip(params.content)}`,
        data: { type: 'community', path: `/community?post=${params.postId}` },
      });
    });
  }

  private async churchTitle(churchId: number): Promise<string> {
    return (await this.repository.findChurchName(churchId)) || DEFAULT_TITLE;
  }

  private async deliver(tokens: string[], message: PushMessage): Promise<number> {
    if (tokens.length === 0) return 0;
    const { sent, stale } = await this.sender.send(tokens, message);
    if (stale.length > 0) await this.repository.deleteTokens(stale);
    return sent;
  }

  private async safely(run: () => Promise<number>): Promise<number> {
    try {
      return await run();
    } catch (error) {
      this.logger.warn(`온교회 푸시 발송 실패: ${error}`);
      return 0;
    }
  }
}
