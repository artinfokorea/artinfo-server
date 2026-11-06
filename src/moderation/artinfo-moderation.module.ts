import { Module } from '@nestjs/common';
import { ArtinfoModerationController } from '@/moderation/artinfo-moderation.controller';
import { ArtinfoModerationRepository } from '@/moderation/artinfo-moderation.repository';

/** 아트인포 커뮤니티 신고·차단 (App Store 1.2 UGC) */
@Module({
  controllers: [ArtinfoModerationController],
  providers: [ArtinfoModerationRepository],
})
export class ArtinfoModerationModule {}
