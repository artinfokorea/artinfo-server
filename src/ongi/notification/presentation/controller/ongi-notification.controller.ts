import { RestApiController, RestApiGet, RestApiPost } from '@/common/decorator/rest-api';
import { AuthSignature } from '@/common/decorator/AuthSignature';
import { UserSignature } from '@/common/type/type';
import { USER_TYPE } from '@/user/entity/user.entity';
import { OkResponse } from '@/common/response/ok.response';
import { OngiReadNotificationsUseCase, OngiScanNotificationsUseCase } from '@/ongi/notification/application/usecase/ongi-notification.usecase';
import { OngiNotificationListResponse } from '@/ongi/notification/presentation/dto/response/ongi-notification.response';

@RestApiController('/ongi/notifications', 'Ongi Notification')
export class OngiNotificationController {
  constructor(
    private readonly scanNotificationsUseCase: OngiScanNotificationsUseCase,
    private readonly readNotificationsUseCase: OngiReadNotificationsUseCase,
  ) {}

  @RestApiGet(OngiNotificationListResponse, { path: '/', description: '내 알림 목록 (최신순 50개)', auth: [USER_TYPE.CLIENT] })
  async scanNotifications(@AuthSignature() signature: UserSignature) {
    const notifications = await this.scanNotificationsUseCase.execute(signature.id);

    return new OngiNotificationListResponse(notifications);
  }

  @RestApiPost(OkResponse, { path: '/read', description: '내 알림 모두 읽음 처리', auth: [USER_TYPE.CLIENT] })
  async readNotifications(@AuthSignature() signature: UserSignature) {
    await this.readNotificationsUseCase.execute(signature.id);

    return new OkResponse();
  }
}
