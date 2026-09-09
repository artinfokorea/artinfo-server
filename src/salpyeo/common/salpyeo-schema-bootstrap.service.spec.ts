import { DataSource } from 'typeorm';
import { SalpyeoSchemaBootstrapService } from './salpyeo-schema-bootstrap.service';
import { SALPYEO_FACILITY_SEED } from '@/salpyeo/facility/domain/constant/salpyeo-facility-seed.constant';

/**
 * 스펙 (DataSource 를 흉내 내 실행되는 SQL 형태만 검증 — 실제 Postgres 검증은 배포 후 운영 확인):
 * 1) DDL: CREATE TABLE IF NOT EXISTS 1회 + 인덱스 1회 + 뒤늦게 추가된 컬럼 6개 ALTER ... ADD COLUMN IF NOT EXISTS
 * 2) 시드 456건은 100건씩 5번 upsert — 한 행당 파라미터 23개(slug + 22 컬럼), jsonb 컬럼은 ::jsonb 캐스팅, ON CONFLICT (slug) DO UPDATE
 * 3) 마지막에 시드에 없는 slug 를 SELECT 로 찾아 DELETE (SELECT 파라미터는 시드 slug 456개 배열, DELETE 파라미터는 찾은 slug). 없으면 DELETE 생략
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

  it('DDL 멱등 적용 후 시드를 100건씩 upsert 하고 시드 밖 slug 를 지운다', async () => {
    delete process.env['SALPYEO_REPOSITORY'];
    const query = jest.fn<Promise<unknown>, [string, unknown[]?]>(async sql => (sql.startsWith('SELECT slug') ? [{ slug: 'p1' }, { slug: 'n1' }] : []));
    await makeService(query).onModuleInit();

    const calls = query.mock.calls.map(([sql, params]) => [sql.replace(/\s+/g, ' ').trim(), params ?? []] as const);
    expect(calls[0][0]).toMatch(/^CREATE TABLE IF NOT EXISTS salpyeo_facilities \(/);
    expect(calls[1][0]).toBe('CREATE INDEX IF NOT EXISTS idx_salpyeo_facilities_vertical_active ON salpyeo_facilities (vertical, is_active)');
    expect(calls.slice(2, 8).map(c => c[0])).toEqual([
      `ALTER TABLE salpyeo_facilities ADD COLUMN IF NOT EXISTS sido VARCHAR(20) NOT NULL DEFAULT ''`,
      `ALTER TABLE salpyeo_facilities ADD COLUMN IF NOT EXISTS sigungu VARCHAR(40) NOT NULL DEFAULT ''`,
      `ALTER TABLE salpyeo_facilities ADD COLUMN IF NOT EXISTS operator_type VARCHAR(20) NOT NULL DEFAULT ''`,
      `ALTER TABLE salpyeo_facilities ADD COLUMN IF NOT EXISTS address VARCHAR(200) NOT NULL DEFAULT ''`,
      `ALTER TABLE salpyeo_facilities ADD COLUMN IF NOT EXISTS phone VARCHAR(30) NOT NULL DEFAULT ''`,
      `ALTER TABLE salpyeo_facilities ADD COLUMN IF NOT EXISTS website VARCHAR(300) NOT NULL DEFAULT ''`,
    ]);

    const upserts = calls.slice(8, 13);
    expect(upserts.map(c => c[1].length)).toEqual([2300, 2300, 2300, 2300, 56 * 23]);
    const [firstSql, firstParams] = upserts[0];
    expect(firstSql).toMatch(
      /^INSERT INTO salpyeo_facilities \(slug, vertical, name, meta, sido, sigungu, operator_type, address, phone, website, distance_label, distance_minutes, inspection_badge, feature_badge, price, rating, review_count, vs_avg_percent, images, price_rows, inspections, review, sort_order\) VALUES \(\$1, \$2, \$3, \$4, \$5, \$6, \$7, \$8, \$9, \$10, \$11, \$12, \$13, \$14, \$15, \$16, \$17, \$18, \$19::jsonb, \$20::jsonb, \$21::jsonb, \$22::jsonb, \$23\), \(\$24, /,
    );
    expect(firstSql).toContain('($2278, $2279');
    expect(firstSql).toMatch(
      /\$2300\) ON CONFLICT \(slug\) DO UPDATE SET vertical = EXCLUDED\.vertical, name = EXCLUDED\.name, .*sort_order = EXCLUDED\.sort_order, updated_at = now\(\)$/,
    );
    // 앞 7개는 공공데이터 고정값. 주소·전화·홈페이지·사진은 공식 홈페이지 보강에 따라 달라지므로 형태만 확인한다.
    expect(firstParams.slice(0, 7)).toEqual(['post-a9656bde', 'post', '올리비움산후조리원', '서울 종로구', '서울', '종로구', '민간']);
    expect(firstParams.slice(7, 10).every(v => typeof v === 'string')).toBe(true);
    // jsonb 4개는 문자열로 직렬화해 보내고, 마지막은 원본 순번
    const [images, priceRows, inspections, review, sortOrder] = firstParams.slice(18, 23);
    expect(Array.isArray(JSON.parse(images as string))).toBe(true);
    expect(JSON.parse(priceRows as string)[0]).toMatchObject({ room: '일반실', price: expect.stringContaining('만원') });
    expect(inspections).toBe('[]');
    expect(review).toBeNull();
    expect(sortOrder).toBe(1);

    const [staleSql, staleParams] = calls[13];
    expect(staleSql).toBe('SELECT slug FROM salpyeo_facilities WHERE NOT (slug = ANY($1::text[]))');
    expect(staleParams).toEqual([SALPYEO_FACILITY_SEED.map(s => s.slug)]);
    expect(staleParams[0]).toHaveLength(456);
    expect(calls[14]).toEqual(['DELETE FROM salpyeo_facilities WHERE slug = ANY($1::text[])', [['p1', 'n1']]]);
    expect(calls).toHaveLength(15);
  });

  it('시드 밖 slug 가 없으면 DELETE 를 실행하지 않는다', async () => {
    delete process.env['SALPYEO_REPOSITORY'];
    const query = jest.fn<Promise<unknown>, [string, unknown[]?]>().mockResolvedValue([]);
    await makeService(query).onModuleInit();
    const sqls = query.mock.calls.map(([sql]) => sql.trim().split(' ')[0]);
    expect(sqls.filter(s => s === 'DELETE')).toHaveLength(0);
    expect(sqls).toHaveLength(14);
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
