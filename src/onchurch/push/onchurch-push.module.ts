import { Module } from '@nestjs/common';
import { OnchurchPushController } from '@/onchurch/push/onchurch-push.controller';
import { OnchurchPushRepository } from '@/onchurch/push/onchurch-push.repository';
import { OnchurchPushService } from '@/onchurch/push/onchurch-push.service';
import { OnchurchExpoPushSender } from '@/onchurch/push/onchurch-expo-push.sender';

/** 온교회 앱 푸시 — /onchurch/push (토큰·알림 설정). 글·댓글 모듈이 OnchurchPushService 로 발송한다 */
@Module({
  controllers: [OnchurchPushController],
  providers: [OnchurchPushRepository, OnchurchPushService, OnchurchExpoPushSender],
  exports: [OnchurchPushService],
})
export class OnchurchPushModule {}
