import {
  assertCanChangeType,
  assertCanWithdraw,
  clampPage,
  clampSize,
  filterWhereSql,
  maskPhone,
  normalizeFilter,
  normalizeQuery,
} from '@/admin/domain/admin-users.policy';
import { AdminSelfActionForbidden, AdminTargetIsAdmin, AdminUserAlreadyWithdrawn, AdminUserNotFound } from '@/admin/domain/artinfo-admin.exception';

/**
 * 기대값: 회원 관리 정책
 * - 필터는 7가지만 허용, 모르는 값은 all.
 * - app 필터는 푸시 토큰 보유, push_on 은 설정 행이 없으면 켜진 것으로 본다.
 * - page 는 1 이상, size 는 1~100 (기본 20).
 * - 검색어는 공백 제거·빈 값 null·100자 제한.
 * - 전화번호는 앞 3·뒤 4자리만 남긴다.
 * - 역할 변경: 자기 자신 불가. 탈퇴 처리: 자기 자신·관리자·이미 탈퇴 불가.
 */
describe('admin-users.policy', () => {
  it('normalizeFilter — 허용된 값만, 그 외는 all', () => {
    expect(normalizeFilter('app')).toBe('app');
    expect(normalizeFilter('withdrawn')).toBe('withdrawn');
    expect(normalizeFilter('nope')).toBe('all');
    expect(normalizeFilter(undefined)).toBe('all');
  });

  it('filterWhereSql — app 은 토큰 보유, web 은 미보유, push_on 은 COALESCE(job, TRUE)', () => {
    expect(filterWhereSql('all')).toBe('u.deleted_at IS NULL');
    expect(filterWhereSql('app')).toBe('u.deleted_at IS NULL AND EXISTS (SELECT 1 FROM artinfo_push_tokens t WHERE t.user_id = u.id)');
    expect(filterWhereSql('web')).toBe('u.deleted_at IS NULL AND NOT EXISTS (SELECT 1 FROM artinfo_push_tokens t WHERE t.user_id = u.id)');
    expect(filterWhereSql('push_on')).toContain(`COALESCE((SELECT p.job FROM artinfo_push_preferences p WHERE p.user_id = u.id), TRUE) = TRUE`);
    expect(filterWhereSql('push_off')).toContain(`= FALSE`);
    expect(filterWhereSql('admin')).toBe(`u.deleted_at IS NULL AND u.type = 'ADMIN'`);
    expect(filterWhereSql('withdrawn')).toBe('u.deleted_at IS NOT NULL');
  });

  it('clampPage / clampSize', () => {
    expect(clampPage(undefined)).toBe(1);
    expect(clampPage(0)).toBe(1);
    expect(clampPage(3.7)).toBe(3);
    expect(clampPage(NaN)).toBe(1);
    expect(clampSize(undefined)).toBe(20);
    expect(clampSize(0)).toBe(1);
    expect(clampSize(500)).toBe(100);
    expect(clampSize(50)).toBe(50);
  });

  it('normalizeQuery — 공백 제거, 빈 값 null, 100자 제한', () => {
    expect(normalizeQuery('  홍길동 ')).toBe('홍길동');
    expect(normalizeQuery('   ')).toBeNull();
    expect(normalizeQuery(undefined)).toBeNull();
    expect(normalizeQuery('a'.repeat(150))).toHaveLength(100);
  });

  it('maskPhone — 앞 3·뒤 4자리만 남긴다', () => {
    expect(maskPhone('010-1234-5678')).toBe('010-****-5678');
    expect(maskPhone('01012345678')).toBe('010****5678');
    expect(maskPhone('1234')).toBe('****');
    expect(maskPhone(null)).toBeNull();
    expect(maskPhone('')).toBeNull();
  });

  const me = 1;
  const client = { id: 2, type: 'CLIENT', deletedAt: null };
  const admin = { id: 3, type: 'ADMIN', deletedAt: null };
  const gone = { id: 4, type: 'CLIENT', deletedAt: new Date('2026-01-01') };

  it('assertCanChangeType — 없는 회원·탈퇴 회원·자기 자신은 불가, 다른 회원은 가능', () => {
    expect(() => assertCanChangeType(me, null)).toThrow(AdminUserNotFound);
    expect(() => assertCanChangeType(me, gone)).toThrow(AdminUserAlreadyWithdrawn);
    expect(() => assertCanChangeType(me, { ...client, id: me })).toThrow(AdminSelfActionForbidden);
    expect(() => assertCanChangeType(me, client)).not.toThrow();
    expect(() => assertCanChangeType(me, admin)).not.toThrow();
  });

  it('assertCanWithdraw — 자기 자신·관리자·이미 탈퇴는 불가', () => {
    expect(() => assertCanWithdraw(me, null)).toThrow(AdminUserNotFound);
    expect(() => assertCanWithdraw(me, gone)).toThrow(AdminUserAlreadyWithdrawn);
    expect(() => assertCanWithdraw(me, { ...client, id: me })).toThrow(AdminSelfActionForbidden);
    expect(() => assertCanWithdraw(me, admin)).toThrow(AdminTargetIsAdmin);
    expect(() => assertCanWithdraw(me, client)).not.toThrow();
  });
});
