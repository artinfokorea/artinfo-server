import { Query } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, Max, Min } from 'class-validator';
import { RestApiController, RestApiGet } from '@/common/decorator/rest-api';
import { Holy365OptionalUser, Holy365Signature } from '@/holy365/common/holy365-auth.guard';
import { Holy365CommunityRepository } from '@/holy365/community/infrastructure/holy365-community.repository';
import { HOLY365_RANKING_PERIODS, Holy365RankingPeriod, periodStart, rankRows } from '@/holy365/community/domain/holy365-period';
import { kstDateOf } from '@/holy365/common/holy365-kst';

class Holy365RankingQuery {
  @IsIn(HOLY365_RANKING_PERIODS)
  @ApiProperty({ enum: HOLY365_RANKING_PERIODS, description: 'day: 오늘 · week: 이번 주(월~) · month: 이번 달 · year: 올해' })
  period: Holy365RankingPeriod;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  @ApiProperty({ required: false, example: 10 })
  limit?: number;
}

class Holy365RankingResponse {
  @ApiProperty()
  period: string;

  @ApiProperty({ description: '기간 시작일 (한국 날짜)' })
  since: string;

  @ApiProperty({ type: 'array', items: { type: 'object' } })
  rows: object[];

  @ApiProperty({ nullable: true, description: '로그인했을 때 내 순위 (기록이 없으면 null)' })
  me: object | null;
}

class Holy365CommunityStatsResponse {
  @ApiProperty()
  todayWriters: number;

  @ApiProperty()
  todayVerses: number;

  @ApiProperty()
  totalWriters: number;

  @ApiProperty()
  totalVerses: number;

  @ApiProperty({ type: 'array', items: { type: 'object' } })
  popularChapters: object[];
}

@RestApiController('/holy365/community', 'Holy365 Community')
export class Holy365CommunityController {
  constructor(private readonly communityRepository: Holy365CommunityRepository) {}

  @RestApiGet(Holy365RankingResponse, { path: '/rankings', description: '일간 · 주간 · 월간 · 연간 필사 랭킹 (로그인하면 내 순위 포함)' })
  async rankings(@Query() query: Holy365RankingQuery, @Holy365OptionalUser() user: Holy365Signature | null) {
    const since = periodStart(query.period, kstDateOf(new Date()));
    const rows = await this.communityRepository.ranking(since, query.limit ?? 10);
    const me = user ? await this.communityRepository.myRank(user.id, since) : null;

    return {
      period: query.period,
      since,
      rows: rankRows(rows).map(row => ({ rank: row.rank, userId: String(row.userId), name: row.name, iconImageUrl: row.iconImageUrl, verses: row.verses })),
      me,
    };
  }

  @RestApiGet(Holy365CommunityStatsResponse, { path: '/stats', description: '함께 필사 현황 — 오늘·누적 필사자와 절 수, 이번 주 많이 쓰는 장' })
  async stats() {
    const [stats, popularChapters] = await Promise.all([this.communityRepository.stats(kstDateOf(new Date())), this.communityRepository.popularChapters(6)]);

    return { ...stats, popularChapters };
  }
}
