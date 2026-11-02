import { Module } from '@nestjs/common';
import { ArtinfoActivityController } from '@/activity/artinfo-activity.controller';
import { ArtinfoActivityRepository } from '@/activity/repository/artinfo-activity.repository';

/** 아트인포 웹 방문 기록 — 비회원 포함 DAU·WAU·MAU·리텐션·체류시간의 원본 */
@Module({
  controllers: [ArtinfoActivityController],
  providers: [ArtinfoActivityRepository],
})
export class ArtinfoActivityModule {}
