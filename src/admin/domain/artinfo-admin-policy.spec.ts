import { assertArtinfoAdmin } from '@/admin/domain/artinfo-admin-policy';
import { ArtinfoAdminForbidden } from '@/admin/domain/artinfo-admin.exception';

describe('assertArtinfoAdmin', () => {
  it('type 이 ADMIN 이고 탈퇴하지 않았으면 통과한다', () => {
    expect(() => assertArtinfoAdmin({ type: 'ADMIN', deletedAt: null })).not.toThrow();
  });

  it('일반 회원(CLIENT)은 거부한다', () => {
    expect(() => assertArtinfoAdmin({ type: 'CLIENT', deletedAt: null })).toThrow(ArtinfoAdminForbidden);
  });

  it('탈퇴한 관리자는 거부한다', () => {
    expect(() => assertArtinfoAdmin({ type: 'ADMIN', deletedAt: new Date('2026-10-01T00:00:00Z') })).toThrow(ArtinfoAdminForbidden);
  });

  it('사용자를 찾지 못하면 거부한다', () => {
    expect(() => assertArtinfoAdmin(null)).toThrow(ArtinfoAdminForbidden);
  });
});
