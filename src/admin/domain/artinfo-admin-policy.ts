import { USER_TYPE } from '@/user/entity/user.entity';
import { ArtinfoAdminForbidden } from '@/admin/domain/artinfo-admin.exception';

export interface AdminCandidate {
  type: string;
  deletedAt: Date | null;
}

/**
 * 아트인포 관리자 판정 — DB 의 users.type 이 ADMIN 이고 탈퇴하지 않은 사용자만.
 * (access token 에는 type 이 없으므로 토큰만으로 판단하지 않는다)
 */
export function assertArtinfoAdmin(user: AdminCandidate | null): void {
  if (!user || user.deletedAt || user.type !== USER_TYPE.ADMIN) {
    throw new ArtinfoAdminForbidden();
  }
}
