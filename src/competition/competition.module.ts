import { Module } from '@nestjs/common';
import { CompetitionController } from './competition.controller';
import { CompetitionRepository } from './competition.repository';
import { CompetitionService } from './competition.service';

/** 콩쿠르 공고 — 회원 직접 등록(검토 후 게시) + 추후 수집 소스. 테이블은 기동 시 멱등 생성 */
@Module({
  controllers: [CompetitionController],
  providers: [CompetitionRepository, CompetitionService],
  exports: [CompetitionRepository, CompetitionService],
})
export class CompetitionModule {}
