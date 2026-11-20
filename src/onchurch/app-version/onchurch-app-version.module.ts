import { Module } from '@nestjs/common';
import { OnchurchUserModule } from '@/onchurch/user/onchurch-user.module';
import { OnchurchAppVersionController, OnchurchMasterAppVersionController } from '@/onchurch/app-version/onchurch-app-version.controller';
import { OnchurchAppVersionRepository } from '@/onchurch/app-version/onchurch-app-version.repository';
import { OnchurchAppVersionService } from '@/onchurch/app-version/onchurch-app-version.service';

/** 온교회 앱 버전 — 앱용 확인 API(/onchurch/app/version) + 마스터 저장 API(/onchurch/master/app-versions) */
@Module({
  imports: [OnchurchUserModule],
  controllers: [OnchurchAppVersionController, OnchurchMasterAppVersionController],
  providers: [OnchurchAppVersionRepository, OnchurchAppVersionService],
})
export class OnchurchAppVersionModule {}
