import { RestApiController, RestApiGet, RestApiPost } from '@/common/decorator/rest-api';
import { AuthSignature } from '@/common/decorator/AuthSignature';
import { UserSignature } from '@/common/type/type';
import { USER_TYPE } from '@/user/entity/user.entity';
import {
  OngiCountUnseenNotificationsUseCase,
  OngiMarkNotificationsSeenUseCase,
  OngiScanMyNotificationsUseCase,
} from '@/ongi/notification/application/usecase/ongi-notification.usecase';
import {
  OngiNotificationListResponse,
  OngiNotificationsSeenResponse,
  OngiUnseenNotificationCountResponse,
} from '@/ongi/notification/presentation/dto/response/ongi-notification.response';

@RestApiController('/ongi/notifications', 'Ongi Notification')
export class OngiNotificationController {
  constructor(
    private readonly scanMyNotificationsUseCase: OngiScanMyNotificationsUseCase,
    private readonly countUnseenNotificationsUseCase: OngiCountUnseenNotificationsUseCase,
    private readonly markNotificationsSeenUseCase: OngiMarkNotificationsSeenUseCase,
  ) {}

  @RestApiGet(OngiNotificationListResponse, { path: '/', description: '내 알림 목록 (최근 30일, 최근 순) + 마지막으로 연 시각', auth: [USER_TYPE.CLIENT] })
  async scanMine(@AuthSignature() signature: UserSignature) {
    return new OngiNotificationListResponse(await this.scanMyNotificationsUseCase.execute(signature.id));
  }

  @RestApiGet(OngiUnseenNotificationCountResponse, {
    path: '/unseen-count',
    description: '마지막으로 연 뒤 생긴 알림 개수 (종 아이콘 배지)',
    auth: [USER_TYPE.CLIENT],
  })
  async countUnseen(@AuthSignature() signature: UserSignature) {
    return new OngiUnseenNotificationCountResponse(await this.countUnseenNotificationsUseCase.execute(signature.id));
  }

  @RestApiPost(OngiNotificationsSeenResponse, {
    path: '/seen',
    description: '알림 목록을 열었다 — 지금까지 알림을 전부 본 것으로 처리',
    auth: [USER_TYPE.CLIENT],
  })
  async markSeen(@AuthSignature() signature: UserSignature) {
    return new OngiNotificationsSeenResponse(await this.markNotificationsSeenUseCase.execute(signature.id));
  }
}
