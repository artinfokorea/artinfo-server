import { Module } from '@nestjs/common';
import { AzeyoAuthModule } from '@/azeyo/auth/azeyo-auth.module';
import { AzeyoUserModule } from '@/azeyo/user/azeyo-user.module';
import { AzeyoSnsModule } from '@/azeyo/sns/azeyo-sns.module';
import { AzeyoCommunityModule } from '@/azeyo/community/azeyo-community.module';
import { AzeyoJokboModule } from '@/azeyo/jokbo/azeyo-jokbo.module';
import { AzeyoScheduleModule } from '@/azeyo/schedule/azeyo-schedule.module';
import { AzeyoNotificationModule } from '@/azeyo/notification/azeyo-notification.module';
import { AzeyoGatewayModule } from '@/azeyo/gateway/azeyo-gateway.module';
import { AzeyoAdminModule } from '@/azeyo/admin/azeyo-admin.module';
import { AzeyoContentModule } from '@/azeyo/content/azeyo-content.module';

@Module({
  imports: [AzeyoAuthModule, AzeyoUserModule, AzeyoSnsModule, AzeyoCommunityModule, AzeyoJokboModule, AzeyoScheduleModule, AzeyoNotificationModule, AzeyoGatewayModule, AzeyoAdminModule, AzeyoContentModule],
})
export class AzeyoModule {}
