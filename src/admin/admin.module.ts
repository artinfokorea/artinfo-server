import { Module } from '@nestjs/common';
import { AdminStatsController } from '@/admin/admin-stats.controller';
import { AdminStatsService } from '@/admin/admin-stats.service';
import { AdminStatsRepository } from '@/admin/repository/admin-stats.repository';
import { ArtinfoAdminGuard } from '@/admin/guard/artinfo-admin.guard';

/** 아트인포 관리자 — 지표 대시보드 API (/admin/stats/*). ADMIN 만 접근 */
@Module({
  controllers: [AdminStatsController],
  providers: [AdminStatsService, AdminStatsRepository, ArtinfoAdminGuard],
})
export class AdminModule {}
