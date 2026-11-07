import { Module } from '@nestjs/common';
import { SchedulerLockModule } from '@/common/scheduler/scheduler-lock.module';
import { ArtinfoPushController } from '@/push/artinfo-push.controller';
import { ArtinfoPushRepository } from '@/push/artinfo-push.repository';
import { ArtinfoPushScheduler } from '@/push/artinfo-push.scheduler';
import { ArtinfoPushService } from '@/push/artinfo-push.service';

/** 아트인포 앱 푸시 — 토큰·수신 설정·관리자 테스트 API, 매일 12:00 KST 채용 요약 스케줄러, Expo 발송 서비스 */
@Module({
  imports: [SchedulerLockModule],
  controllers: [ArtinfoPushController],
  providers: [ArtinfoPushRepository, ArtinfoPushService, ArtinfoPushScheduler],
  exports: [ArtinfoPushService],
})
export class ArtinfoPushModule {}
