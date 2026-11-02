import { ExecutionContext, Injectable } from '@nestjs/common';
import { JwtAuthGuard } from '@/common/security/jwt-auth.guard';
import { AdminStatsRepository } from '@/admin/repository/admin-stats.repository';
import { assertArtinfoAdmin } from '@/admin/domain/artinfo-admin-policy';

/**
 * 아트인포 관리자 API 가드 — JWT 인증 후, DB 의 users.type 이 ADMIN 인지 매 요청 확인한다.
 * (access token 에는 type 이 없어서 기존 `auth: [USER_TYPE.ADMIN]` 옵션만으로는 역할이 검사되지 않는다)
 */
@Injectable()
export class ArtinfoAdminGuard extends JwtAuthGuard {
  constructor(private readonly adminStatsRepository: AdminStatsRepository) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    await super.canActivate(context);
    const request = context.switchToHttp().getRequest();
    const user = await this.adminStatsRepository.findUserForAdminCheck(request.user.id);
    assertArtinfoAdmin(user);
    return true;
  }
}
