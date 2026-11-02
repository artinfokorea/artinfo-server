import { Injectable } from '@nestjs/common';
import { AdminStatsRepository } from '@/admin/repository/admin-stats.repository';
import { buildDailySeries, clampDays, kstDateString } from '@/admin/domain/admin-stats.calculator';
import { AdminBreakdownResponse, AdminDailyResponse, AdminOverviewResponse, maskEmail } from '@/admin/dto/admin-stats.response';

@Injectable()
export class AdminStatsService {
  constructor(private readonly repository: AdminStatsRepository) {}

  async overview(): Promise<AdminOverviewResponse> {
    const r = await this.repository.overview();
    return {
      users: { total: r.users, last7d: r.users_7d, last30d: r.users_30d },
      activeUsers: { total: r.active_users_30d, last7d: r.active_users_7d, last30d: r.active_users_30d },
      jobs: { total: r.jobs, last7d: r.jobs_7d, last30d: r.jobs_30d },
      activeJobs: r.active_jobs,
      posts: { total: r.posts, last7d: r.posts_7d, last30d: r.posts_30d },
      comments: { total: r.comments, last7d: r.comments_7d, last30d: 0 },
      lessons: r.lessons,
      performances: r.performances,
      upcomingPerformances: r.upcoming_performances,
      news: r.news,
      inquiries: { total: r.inquiries, last7d: 0, last30d: r.inquiries_30d },
    };
  }

  async daily(days: number | undefined, now = new Date()): Promise<AdminDailyResponse> {
    const range = clampDays(days);
    const rows = await this.repository.daily(range);
    return { days: range, points: buildDailySeries(rows, range, kstDateString(now)) };
  }

  async breakdown(): Promise<AdminBreakdownResponse> {
    const [loginsByType, jobsByType, recentUsers, topPosts, recentInquiries] = await Promise.all([
      this.repository.loginsByType(),
      this.repository.jobsByType(),
      this.repository.recentUsers(10),
      this.repository.topPosts(5),
      this.repository.recentInquiries(5),
    ]);
    return {
      loginsByType,
      jobsByType,
      recentUsers: recentUsers.map(u => ({ ...u, email: maskEmail(u.email) })),
      topPosts,
      recentInquiries: recentInquiries.map(i => ({ ...i, email: maskEmail(i.email) })),
    };
  }
}
