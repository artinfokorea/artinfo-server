import { Module } from '@nestjs/common';
import { ArtinfoPushController } from '@/push/artinfo-push.controller';
import { ArtinfoPushRepository } from '@/push/artinfo-push.repository';
import { ArtinfoPushService } from '@/push/artinfo-push.service';

/** 아트인포 앱 푸시 — 토큰·수신 설정 API 와 Expo 발송 서비스 (채용 공고 등록 시 JobController 가 호출) */
@Module({
  controllers: [ArtinfoPushController],
  providers: [ArtinfoPushRepository, ArtinfoPushService],
  exports: [ArtinfoPushService],
})
export class ArtinfoPushModule {}
