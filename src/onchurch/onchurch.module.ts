import { Module } from '@nestjs/common';
import { OnchurchAuthModule } from '@/onchurch/auth/onchurch-auth.module';
import { OnchurchUserModule } from '@/onchurch/user/onchurch-user.module';
import { OnchurchChurchModule } from '@/onchurch/church/onchurch-church.module';
import { OnchurchBannerModule } from '@/onchurch/banner/onchurch-banner.module';
import { OnchurchNoticeModule } from '@/onchurch/notice/onchurch-notice.module';

@Module({
  imports: [OnchurchAuthModule, OnchurchUserModule, OnchurchChurchModule, OnchurchBannerModule, OnchurchNoticeModule],
})
export class OnchurchModule {}
