import { Module } from '@nestjs/common';
import { AppVersionController } from '@/app-version/app-version.controller';
import { AppVersionRepository } from '@/app-version/app-version.repository';
import { AppVersionService } from '@/app-version/app-version.service';

/** 앱 최소 버전 — 앱용 확인 API(/app/version). 관리자 저장 API 는 AdminModule 이 AppVersionService 를 가져다 쓴다 */
@Module({
  controllers: [AppVersionController],
  providers: [AppVersionRepository, AppVersionService],
  exports: [AppVersionService],
})
export class AppVersionModule {}
