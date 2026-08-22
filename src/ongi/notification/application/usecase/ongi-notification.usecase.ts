import { Inject, Injectable } from '@nestjs/common';
import {
  IOngiNotificationRepository,
  ONGI_NOTIFICATION_REPOSITORY,
} from '@/ongi/notification/domain/repository/ongi-notification.repository.interface';
import { ONGI_NOTIFICATION_TYPE, OngiNotification } from '@/ongi/notification/domain/entity/ongi-notification.entity';
import { IOngiMemberRepository, ONGI_MEMBER_REPOSITORY } from '@/ongi/group/domain/repository/ongi-member.repository.interface';
import { OngiMember } from '@/ongi/group/domain/entity/ongi-member.entity';
import { OngiPhoto } from '@/ongi/photo/domain/entity/ongi-photo.entity';

const SCAN_LIMIT = 50;
const COMMENT_SNIPPET_LENGTH = 40;

@Injectable()
export class OngiScanNotificationsUseCase {
  constructor(
    @Inject(ONGI_NOTIFICATION_REPOSITORY)
    private readonly notificationRepository: IOngiNotificationRepository,
  ) {}

  async execute(userId: number): Promise<OngiNotification[]> {
    return this.notificationRepository.scanByRecipientUserId(userId, SCAN_LIMIT);
  }
}

@Injectable()
export class OngiReadNotificationsUseCase {
  constructor(
    @Inject(ONGI_NOTIFICATION_REPOSITORY)
    private readonly notificationRepository: IOngiNotificationRepository,
  ) {}

  async execute(userId: number): Promise<void> {
    await this.notificationRepository.markAllRead(userId);
  }
}

/** 다른 피처(사진 등)에서 이벤트가 생겼을 때 알림 레코드를 만든다 */
@Injectable()
export class OngiNotifyService {
  constructor(
    @Inject(ONGI_NOTIFICATION_REPOSITORY)
    private readonly notificationRepository: IOngiNotificationRepository,

    @Inject(ONGI_MEMBER_REPOSITORY)
    private readonly memberRepository: IOngiMemberRepository,
  ) {}

  /** 새 사진 업로드 — 올린 사람을 제외한 그룹 전원에게 */
  async photoUploaded(groupId: number, actor: OngiMember, photos: OngiPhoto[]): Promise<void> {
    if (photos.length === 0) return;

    const views = await this.memberRepository.scanViewsByGroupId(groupId);
    const recipients = views.map(view => view.member).filter(member => member.userId !== actor.userId);

    const message =
      photos.length > 1 ? `${actor.name}님이 사진 ${photos.length}장을 올렸어요` : `${actor.name}님이 새 사진을 올렸어요`;

    await this.safeCreate(
      recipients.map(member => ({
        recipientUserId: member.userId,
        groupId,
        type: ONGI_NOTIFICATION_TYPE.PHOTO_UPLOADED,
        message,
        actorMemberId: actor.id,
        photoId: photos[0].id,
        photoUrl: photos[0].url,
      })),
    );
  }

  /** 따뜻해요 — 사진 작성자에게 (내 사진이면 알리지 않음) */
  async photoLiked(photo: OngiPhoto, actor: OngiMember): Promise<void> {
    const author = await this.memberRepository.findById(photo.authorMemberId);
    if (!author || author.userId === actor.userId) return;

    await this.safeCreate([
      {
        recipientUserId: author.userId,
        groupId: photo.groupId,
        type: ONGI_NOTIFICATION_TYPE.PHOTO_LIKED,
        message: `${actor.name}님이 회원님의 사진을 따뜻해했어요`,
        actorMemberId: actor.id,
        photoId: photo.id,
        photoUrl: photo.url,
      },
    ]);
  }

  /** 댓글 — 사진 작성자에게 (내 사진이면 알리지 않음) */
  async commentAdded(photo: OngiPhoto, actor: OngiMember, text: string): Promise<void> {
    const author = await this.memberRepository.findById(photo.authorMemberId);
    if (!author || author.userId === actor.userId) return;

    const snippet = text.length > COMMENT_SNIPPET_LENGTH ? text.slice(0, COMMENT_SNIPPET_LENGTH) + '…' : text;

    await this.safeCreate([
      {
        recipientUserId: author.userId,
        groupId: photo.groupId,
        type: ONGI_NOTIFICATION_TYPE.COMMENT_ADDED,
        message: `${actor.name}님이 댓글을 남겼어요: ${snippet}`,
        actorMemberId: actor.id,
        photoId: photo.id,
        photoUrl: photo.url,
      },
    ]);
  }

  /** 알림은 부가 기능 — 실패해도 (예: 테이블 미생성) 원래 동작을 깨뜨리지 않는다 */
  private async safeCreate(creators: Parameters<IOngiNotificationRepository['createMany']>[0]): Promise<void> {
    try {
      await this.notificationRepository.createMany(creators);
    } catch (e) {
      console.error('[ongi] 알림 생성 실패:', e);
    }
  }
}
