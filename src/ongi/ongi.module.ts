import { Module } from '@nestjs/common';
import { OngiAuthModule } from '@/ongi/auth/ongi-auth.module';
import { OngiUserModule } from '@/ongi/user/ongi-user.module';
import { OngiGroupModule } from '@/ongi/group/ongi-group.module';
import { OngiAlbumModule } from '@/ongi/album/ongi-album.module';
import { OngiPhotoModule } from '@/ongi/photo/ongi-photo.module';
import { OngiConfigModule } from '@/ongi/config/ongi-config.module';
import { OngiLegalModule } from '@/ongi/legal/ongi-legal.module';
import { OngiReportModule } from '@/ongi/report/ongi-report.module';
import { OngiPushModule } from '@/ongi/push/ongi-push.module';
import { OngiEventModule } from '@/ongi/event/ongi-event.module';
import { OngiAdminModule } from '@/ongi/admin/ongi-admin.module';
import { OngiSchemaBootstrapService } from '@/ongi/common/ongi-schema-bootstrap.service';

@Module({
  imports: [
    OngiAuthModule,
    OngiUserModule,
    OngiGroupModule,
    OngiAlbumModule,
    OngiPhotoModule,
    OngiLegalModule,
    OngiReportModule,
    OngiPushModule,
    OngiConfigModule,
    OngiEventModule,
    OngiAdminModule,
  ],
  providers: [OngiSchemaBootstrapService],
})
export class OngiModule {}
