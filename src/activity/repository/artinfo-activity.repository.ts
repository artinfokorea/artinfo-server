import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { ARTINFO_ACTIVITY_MAX_PATHS_PER_DAY } from '@/activity/domain/artinfo-activity-policy';

export interface ArtinfoActivityPing {
  visitorId: string;
  userId: number | null;
  seconds: number;
  pageViews: number;
  newSession: boolean;
  userAgent: string | null;
  referrerHost: string | null;
  landingPath: string | null;
  /** 이번 전송 시점에 보고 있던 페이지 — 그날 마지막 값이 이탈 페이지가 된다 */
  exitPath: string | null;
  /** 지난 전송 이후 본 경로 목록 (순서대로) — 그날 행의 paths 뒤에 이어 붙는다 */
  paths: string[];
}

/** now() 는 timestamptz 라 DB 세션 시간대와 상관없이 한국 날짜가 나온다 */
const KST_TODAY = `(now() AT TIME ZONE 'Asia/Seoul')::date`;

@Injectable()
export class ArtinfoActivityRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async addPing(ping: ArtinfoActivityPing): Promise<void> {
    await this.dataSource.query(
      `INSERT INTO artinfo_visitor_daily_activity
         (visitor_id, day, user_id, active_seconds, session_count, page_views, user_agent, referrer_host, landing_path, exit_path, paths)
       VALUES ($1, ${KST_TODAY}, $2, $3, $4, $5, $6, $7, $8, $9, $10::jsonb)
       ON CONFLICT (visitor_id, day) DO UPDATE SET
         last_seen_at = now(),
         user_id = COALESCE(EXCLUDED.user_id, artinfo_visitor_daily_activity.user_id),
         active_seconds = LEAST(artinfo_visitor_daily_activity.active_seconds + EXCLUDED.active_seconds, 86400),
         session_count = artinfo_visitor_daily_activity.session_count + EXCLUDED.session_count,
         page_views = LEAST(artinfo_visitor_daily_activity.page_views + EXCLUDED.page_views, 10000),
         user_agent = COALESCE(EXCLUDED.user_agent, artinfo_visitor_daily_activity.user_agent),
         referrer_host = COALESCE(artinfo_visitor_daily_activity.referrer_host, EXCLUDED.referrer_host),
         landing_path = COALESCE(artinfo_visitor_daily_activity.landing_path, EXCLUDED.landing_path),
         exit_path = COALESCE(EXCLUDED.exit_path, artinfo_visitor_daily_activity.exit_path),
         paths = (
           SELECT COALESCE(jsonb_agg(p ORDER BY i), '[]'::jsonb)
             FROM jsonb_array_elements(artinfo_visitor_daily_activity.paths || EXCLUDED.paths) WITH ORDINALITY AS t(p, i)
            WHERE i <= ${ARTINFO_ACTIVITY_MAX_PATHS_PER_DAY}
         )`,
      [
        ping.visitorId,
        ping.userId,
        ping.seconds,
        ping.newSession ? 1 : 0,
        ping.pageViews,
        ping.userAgent,
        ping.referrerHost,
        ping.landingPath,
        ping.exitPath,
        JSON.stringify(ping.paths),
      ],
    );
  }
}
