import { DataSource } from 'typeorm';
import { SalpyeoSchemaBootstrapService } from './salpyeo-schema-bootstrap.service';
import { SALPYEO_FACILITY_SEED } from '@/salpyeo/facility/domain/constant/salpyeo-facility-seed.constant';

/**
 * 스펙 (DataSource 를 흉내 내 실행되는 SQL 형태만 검증 — 실제 Postgres 검증은 배포 후 운영 확인):
 * 1) DDL: 시설 CREATE TABLE IF NOT EXISTS 1회 + 인덱스 1회 + 뒤늦게 추가된 컬럼 5개 ALTER ... ADD COLUMN IF NOT EXISTS,
 *    이어서 계정·세션(salpyeo_users·salpyeo_auths) 테이블 2개 + 인덱스 3개 + role 컬럼 ALTER 1개
 * 2) 시드 456건은 100건씩 5번 INSERT — 한 행당 파라미터 22개(slug + 21 컬럼), jsonb 컬럼은 ::jsonb 캐스팅
 * 3) **ON CONFLICT (slug) DO NOTHING** — 이미 있는 행은 절대 덮어쓰지 않는다 (관리자 수정 보존).
 *    예전의 DO UPDATE / 시드 밖 slug DELETE 는 없어졌다.
 * 4) SALPYEO_REPOSITORY=memory 면 아무 쿼리도 실행하지 않음
 * 5) 쿼리가 실패해도 예외를 밖으로 던지지 않음 (기동 차단 금지)
 */
describe('SalpyeoSchemaBootstrapService', () => {
  const originalEnv = process.env['SALPYEO_REPOSITORY'];
  afterEach(() => {
    if (originalEnv === undefined) delete process.env['SALPYEO_REPOSITORY'];
    else process.env['SALPYEO_REPOSITORY'] = originalEnv;
  });

  type Query = (sql: string, params?: unknown[]) => Promise<unknown>;
  function makeService(query: jest.MockedFunction<Query>) {
    return new SalpyeoSchemaBootstrapService({ query } as unknown as DataSource);
  }

  it('DDL 을 멱등 적용하고 시드를 100건씩 INSERT 한다', async () => {
    delete process.env['SALPYEO_REPOSITORY'];
    const query = jest.fn<Promise<unknown>, [string, unknown[]?]>().mockResolvedValue([[], 0]);
    await makeService(query).onModuleInit();

    const calls = query.mock.calls.map(([sql, params]) => [sql.replace(/\s+/g, ' ').trim(), params ?? []] as const);
    expect(calls[0][0]).toMatch(/^CREATE TABLE IF NOT EXISTS salpyeo_facilities \(/);
    expect(calls[1][0]).toBe('CREATE INDEX IF NOT EXISTS idx_salpyeo_facilities_vertical_active ON salpyeo_facilities (vertical, is_active)');
    expect(calls.slice(2, 7).map(c => c[0])).toEqual([
      `ALTER TABLE salpyeo_facilities ADD COLUMN IF NOT EXISTS sido VARCHAR(20) NOT NULL DEFAULT ''`,
      `ALTER TABLE salpyeo_facilities ADD COLUMN IF NOT EXISTS sigungu VARCHAR(40) NOT NULL DEFAULT ''`,
      `ALTER TABLE salpyeo_facilities ADD COLUMN IF NOT EXISTS operator_type VARCHAR(20) NOT NULL DEFAULT ''`,
      `ALTER TABLE salpyeo_facilities ADD COLUMN IF NOT EXISTS address VARCHAR(200) NOT NULL DEFAULT ''`,
      `ALTER TABLE salpyeo_facilities ADD COLUMN IF NOT EXISTS phone VARCHAR(30) NOT NULL DEFAULT ''`,
    ]);

    // 구글 로그인 계정·세션 + 관리자 권한 컬럼
    expect(calls[7][0]).toMatch(/^CREATE TABLE IF NOT EXISTS salpyeo_users \(.*role VARCHAR\(16\) NOT NULL DEFAULT 'USER'/);
    expect(calls[8][0]).toBe('CREATE UNIQUE INDEX IF NOT EXISTS uidx_salpyeo_users_sns ON salpyeo_users (sns_type, sns_id) WHERE deleted_at IS NULL');
    expect(calls[9][0]).toBe(`ALTER TABLE salpyeo_users ADD COLUMN IF NOT EXISTS role VARCHAR(16) NOT NULL DEFAULT 'USER'`);
    expect(calls[10][0]).toMatch(/^CREATE TABLE IF NOT EXISTS salpyeo_auths \(/);
    expect(calls[11][0]).toBe('CREATE INDEX IF NOT EXISTS idx_salpyeo_auths_user ON salpyeo_auths (user_id)');
    expect(calls[12][0]).toBe('CREATE INDEX IF NOT EXISTS idx_salpyeo_auths_tokens ON salpyeo_auths (access_token, refresh_token)');

    const inserts = calls.slice(13, 18);
    expect(inserts.map(c => c[1].length)).toEqual([2200, 2200, 2200, 2200, 56 * 22]);

    const [firstSql, firstParams] = inserts[0];
    expect(firstSql).toMatch(
      /^INSERT INTO salpyeo_facilities \(slug, vertical, name, meta, sido, sigungu, operator_type, address, phone, distance_label, distance_minutes, inspection_badge, feature_badge, price, rating, review_count, vs_avg_percent, images, price_rows, inspections, review, sort_order\) VALUES \(\$1, \$2, \$3, \$4, \$5, \$6, \$7, \$8, \$9, \$10, \$11, \$12, \$13, \$14, \$15, \$16, \$17, \$18::jsonb, \$19::jsonb, \$20::jsonb, \$21::jsonb, \$22\), \(\$23, /,
    );
    expect(firstSql).toContain('($2179, $2180');
    // 이미 있는 행은 건드리지 않는다 — 관리자 수정이 배포로 되돌아가면 안 된다
    expect(firstSql).toMatch(/\$2200\) ON CONFLICT \(slug\) DO NOTHING$/);
    expect(firstSql).not.toContain('DO UPDATE');

    expect(firstParams.slice(0, 9)).toEqual([
      'post-a9656bde',
      'post',
      '올리비움산후조리원',
      '서울 종로구',
      '서울',
      '종로구',
      '민간',
      '서울시 종로구 통일로 16길 4-1',
      '02-730-1717',
    ]);

    expect(calls).toHaveLength(18);
  });

  it('시드에 없는 slug 를 지우지 않는다 (관리자가 관리하는 데이터)', async () => {
    delete process.env['SALPYEO_REPOSITORY'];
    const query = jest.fn<Promise<unknown>, [string, unknown[]?]>().mockResolvedValue([[], 0]);
    await makeService(query).onModuleInit();

    const verbs = query.mock.calls.map(([sql]) => sql.trim().split(' ')[0]);
    expect(verbs.filter(v => v === 'DELETE')).toHaveLength(0);
    expect(verbs.filter(v => v === 'SELECT')).toHaveLength(0);
  });

  it('시드 slug 는 456개 그대로다', () => {
    expect(SALPYEO_FACILITY_SEED).toHaveLength(456);
    expect(new Set(SALPYEO_FACILITY_SEED.map(s => s.slug)).size).toBe(456);
  });

  it('메모리 모드에서는 아무것도 실행하지 않는다', async () => {
    process.env['SALPYEO_REPOSITORY'] = 'memory';
    const query = jest.fn<Promise<unknown>, [string, unknown[]?]>();
    await makeService(query).onModuleInit();
    expect(query).not.toHaveBeenCalled();
  });

  it('쿼리 실패는 로그만 남기고 기동을 막지 않는다', async () => {
    delete process.env['SALPYEO_REPOSITORY'];
    const query = jest.fn<Promise<unknown>, [string, unknown[]?]>().mockRejectedValue(new Error('permission denied'));
    await expect(makeService(query).onModuleInit()).resolves.toBeUndefined();
  });
});
