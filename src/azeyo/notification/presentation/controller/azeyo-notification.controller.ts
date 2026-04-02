import { Body, Param, Query } from '@nestjs/common';
import { RestApiController, RestApiGet, RestApiPost, RestApiPut } from '@/common/decorator/rest-api';
import { AuthSignature } from '@/common/decorator/AuthSignature';
import { UserSignature, List } from '@/common/type/type';
import { USER_TYPE } from '@/user/entity/user.entity';
import { OkResponse } from '@/common/response/ok.response';
import { AzeyoScanNotificationsUseCase } from '@/azeyo/notification/application/usecase/azeyo-scan-notifications.usecase';
import { AzeyoMarkNotificationsReadUseCase } from '@/azeyo/notification/application/usecase/azeyo-mark-notifications-read.usecase';
import { AzeyoScanNotificationSettingsUseCase } from '@/azeyo/notification/application/usecase/azeyo-scan-notification-settings.usecase';
import { AzeyoUpdateNotificationSettingsUseCase } from '@/azeyo/notification/application/usecase/azeyo-update-notification-settings.usecase';
import { AzeyoUpdateNotificationSettingsRequest } from '@/azeyo/notification/presentation/dto/request/azeyo-update-notification-settings.request';
import { AzeyoNotificationsResponse } from '@/azeyo/notification/presentation/dto/response/azeyo-notification.response';
import { AzeyoNotificationSettingResponse } from '@/azeyo/notification/presentation/dto/response/azeyo-notification-setting.response';

@RestApiController('/azeyo/notifications', 'Azeyo Notification')
export class AzeyoNotificationController {
  constructor(
    private readonly scanNotificationsUseCase: AzeyoScanNotificationsUseCase,
    private readonly markReadUseCase: AzeyoMarkNotificationsReadUseCase,
    private readonly scanSettingsUseCase: AzeyoScanNotificationSettingsUseCase,
    private readonly updateSettingsUseCase: AzeyoUpdateNotificationSettingsUseCase,
  ) {}

  @RestApiGet(AzeyoNotificationsResponse, { path: '/', description: '알림 목록 조회', auth: [USER_TYPE.CLIENT] })
  async scanNotifications(@AuthSignature() signature: UserSignature, @Query() query: List) {
    const result = await this.scanNotificationsUseCase.execute(signature.id, query.page, query.size);
    return new AzeyoNotificationsResponse(result.items, result.totalCount, result.unreadCount);
  }

  @RestApiPost(OkResponse, { path: '/read-all', description: '알림 모두 읽음', auth: [USER_TYPE.CLIENT] })
  async markAllRead(@AuthSignature() signature: UserSignature) {
    await this.markReadUseCase.execute(signature.id);
    return new OkResponse();
  }

  @RestApiPost(OkResponse, { path: '/:notificationId/read', description: '알림 읽음', auth: [USER_TYPE.CLIENT] })
  async markRead(@AuthSignature() signature: UserSignature, @Param('notificationId') notificationId: number) {
    await this.markReadUseCase.execute(signature.id, notificationId);
    return new OkResponse();
  }

  @RestApiGet(AzeyoNotificationSettingResponse, { path: '/settings', description: '알림 설정 조회', auth: [USER_TYPE.CLIENT] })
  async scanSettings(@AuthSignature() signature: UserSignature) {
    const setting = await this.scanSettingsUseCase.execute(signature.id);
    return new AzeyoNotificationSettingResponse(setting);
  }

  @RestApiPut(OkResponse, { path: '/settings', description: '알림 설정 수정', auth: [USER_TYPE.CLIENT] })
  async updateSettings(@AuthSignature() signature: UserSignature, @Body() request: AzeyoUpdateNotificationSettingsRequest) {
    await this.updateSettingsUseCase.execute(signature.id, request);
    return new OkResponse();
  }
}
