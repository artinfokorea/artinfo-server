import { Module } from '@nestjs/common';
import { OnchurchAuthModule } from '@/onchurch/auth/onchurch-auth.module';
import { OnchurchUserModule } from '@/onchurch/user/onchurch-user.module';
import { OnchurchChurchModule } from '@/onchurch/church/onchurch-church.module';
import { OnchurchBannerModule } from '@/onchurch/banner/onchurch-banner.module';
import { OnchurchNoticeModule } from '@/onchurch/notice/onchurch-notice.module';
import { OnchurchEventModule } from '@/onchurch/event/onchurch-event.module';
import { OnchurchAboutModule } from '@/onchurch/about/onchurch-about.module';
import { OnchurchTransportationModule } from '@/onchurch/transportation/onchurch-transportation.module';
import { OnchurchWorshipModule } from '@/onchurch/worship/onchurch-worship.module';
import { OnchurchSermonModule } from '@/onchurch/sermon/onchurch-sermon.module';
import { OnchurchGalleryModule } from '@/onchurch/gallery/onchurch-gallery.module';
import { OnchurchPrayerModule } from '@/onchurch/prayer/onchurch-prayer.module';
import { OnchurchInquiryModule } from '@/onchurch/inquiry/onchurch-inquiry.module';
import { OnchurchBulletinModule } from '@/onchurch/bulletin/onchurch-bulletin.module';
import { OnchurchCommunityModule } from '@/onchurch/community/onchurch-community.module';
import { OnchurchSaintModule } from '@/onchurch/saint/onchurch-saint.module';
import { OnchurchAttendanceModule } from '@/onchurch/attendance/onchurch-attendance.module';
import { OnchurchMasterModule } from '@/onchurch/master/onchurch-master.module';

@Module({
  imports: [
    OnchurchAuthModule,
    OnchurchUserModule,
    OnchurchChurchModule,
    OnchurchBannerModule,
    OnchurchNoticeModule,
    OnchurchEventModule,
    OnchurchAboutModule,
    OnchurchTransportationModule,
    OnchurchWorshipModule,
    OnchurchSermonModule,
    OnchurchGalleryModule,
    OnchurchPrayerModule,
    OnchurchInquiryModule,
    OnchurchBulletinModule,
    OnchurchCommunityModule,
    OnchurchSaintModule,
    OnchurchAttendanceModule,
    OnchurchMasterModule,
  ],
})
export class OnchurchModule {}
