import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

export interface ArtinfoActivityPing {
  visitorId: string;
  userId: number | null;
  seconds: number;
  newSession: boolean;
}

/** now() 는 timestamptz 라 DB 세션 시간대와 상관없이 한국 날짜가 나온다 */
const KST_TODAY = `(now() AT TIME ZONE 'Asia/Seoul')::date`;

@Injectable()
export class ArtinfoActivityRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async addPing(ping: ArtinfoActivityPing): Promise<void> {
    await this.dataSource.query(
      `INSERT INTO artinfo_visitor_daily_activity (visitor_id, day, user_id, active_seconds, session_count)
       VALUES ($1, ${KST_TODAY}, $2, $3, $4)
       ON CONFLICT (visitor_id, day) DO UPDATE SET
         last_seen_at = now(),
         user_id = COALESCE(EXCLUDED.user_id, artinfo_visitor_daily_activity.user_id),
         active_seconds = LEAST(artinfo_visitor_daily_activity.active_seconds + EXCLUDED.active_seconds, 86400),
         session_count = artinfo_visitor_daily_activity.session_count + EXCLUDED.session_count`,
      [ping.visitorId, ping.userId, ping.seconds, ping.newSession ? 1 : 0],
    );
  }
}
