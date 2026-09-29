import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { IOngiActivityRepository, OngiActivityPing } from '@/ongi/activity/domain/repository/ongi-activity.repository.interface';

/** now() 는 timestamptz 라 DB 세션 시간대와 상관없이 한국 날짜가 나온다 */
const KST_TODAY = `(now() AT TIME ZONE 'Asia/Seoul')::date`;

@Injectable()
export class OngiActivityRepository implements IOngiActivityRepository {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async touch(userId: number, accessToken: string): Promise<void> {
    await this.dataSource.query(
      `INSERT INTO ongi_user_daily_activity (user_id, day)
       SELECT u.id, ${KST_TODAY}
         FROM ongi_users u
        WHERE u.id = $1 AND u.deleted_at IS NULL
          AND EXISTS (SELECT 1 FROM ongi_auths a WHERE a.access_token = $2 AND a.user_id = u.id)
       ON CONFLICT (user_id, day) DO UPDATE SET last_seen_at = now()`,
      [userId, accessToken],
    );
  }

  async addPing(ping: OngiActivityPing): Promise<void> {
    await this.dataSource.query(
      `INSERT INTO ongi_user_daily_activity (user_id, day, foreground_seconds, session_count, platform, app_version)
       SELECT u.id, ${KST_TODAY}, $2, $3, $4, $5
         FROM ongi_users u
        WHERE u.id = $1 AND u.deleted_at IS NULL
       ON CONFLICT (user_id, day) DO UPDATE SET
         last_seen_at = now(),
         foreground_seconds = LEAST(ongi_user_daily_activity.foreground_seconds + EXCLUDED.foreground_seconds, 86400),
         session_count = ongi_user_daily_activity.session_count + EXCLUDED.session_count,
         platform = COALESCE(EXCLUDED.platform, ongi_user_daily_activity.platform),
         app_version = COALESCE(EXCLUDED.app_version, ongi_user_daily_activity.app_version)`,
      [ping.userId, ping.seconds, ping.sessions, ping.platform, ping.appVersion],
    );
  }
}
