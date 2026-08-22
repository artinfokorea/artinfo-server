import { Module } from '@nestjs/common';
import { OngiAuthModule } from '@/ongi/auth/ongi-auth.module';
import { OngiUserModule } from '@/ongi/user/ongi-user.module';
import { OngiGroupModule } from '@/ongi/group/ongi-group.module';
import { OngiPersonModule } from '@/ongi/person/ongi-person.module';
import { OngiAlbumModule } from '@/ongi/album/ongi-album.module';
import { OngiPhotoModule } from '@/ongi/photo/ongi-photo.module';
import { OngiLegalModule } from '@/ongi/legal/ongi-legal.module';
import { OngiReportModule } from '@/ongi/report/ongi-report.module';
import { OngiSchemaBootstrapService } from '@/ongi/common/ongi-schema-bootstrap.service';

@Module({
  imports: [OngiAuthModule, OngiUserModule, OngiGroupModule, OngiPersonModule, OngiAlbumModule, OngiPhotoModule, OngiLegalModule, OngiReportModule],
  providers: [OngiSchemaBootstrapService],
})
export class OngiModule {}
