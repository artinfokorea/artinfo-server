import { Module } from '@nestjs/common';
import { AdminStatsController } from '@/admin/admin-stats.controller';
import { AdminStatsService } from '@/admin/admin-stats.service';
import { AdminStatsRepository } from '@/admin/repository/admin-stats.repository';
import { ArtinfoAdminGuard } from '@/admin/guard/artinfo-admin.guard';
import { AdminUsersController } from '@/admin/admin-users.controller';
import { AdminUsersService } from '@/admin/admin-users.service';
import { AdminUsersRepository } from '@/admin/repository/admin-users.repository';
import { AdminAppVersionController } from '@/admin/admin-app-version.controller';
import { AppVersionModule } from '@/app-version/app-version.module';

/** 아트인포 관리자 — 지표 대시보드(/admin/stats/*)·회원 관리(/admin/users/*)·앱 최소 버전(/admin/app-versions). ADMIN 만 접근 */
@Module({
  imports: [AppVersionModule],
  controllers: [AdminStatsController, AdminUsersController, AdminAppVersionController],
  providers: [AdminStatsService, AdminStatsRepository, AdminUsersService, AdminUsersRepository, ArtinfoAdminGuard],
})
export class AdminModule {}
