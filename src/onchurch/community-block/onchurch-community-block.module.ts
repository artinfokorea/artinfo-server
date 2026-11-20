import { Module } from '@nestjs/common';
import { OnchurchUserModule } from '@/onchurch/user/onchurch-user.module';
import { OnchurchCommunityBlockController } from '@/onchurch/community-block/onchurch-community-block.controller';
import { OnchurchCommunityBlockRepository } from '@/onchurch/community-block/onchurch-community-block.repository';
import { OnchurchCommunityBlockService } from '@/onchurch/community-block/onchurch-community-block.service';

/** 교제 게시판 사용자 차단 — /onchurch/community-blocks/me */
@Module({
  imports: [OnchurchUserModule],
  controllers: [OnchurchCommunityBlockController],
  providers: [OnchurchCommunityBlockRepository, OnchurchCommunityBlockService],
})
export class OnchurchCommunityBlockModule {}
