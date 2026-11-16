import { DataSource } from 'typeorm';
import { AppVersionRepository } from '@/app-version/app-version.repository';

/**
 * 기대값 (DB 없이 SQL 문자열):
 * - ensureSchema: CREATE TABLE IF NOT EXISTS + 플랫폼별 기본 행 INSERT ... ON CONFLICT DO NOTHING (ios, android).
 * - findByPlatform: 없으면 null.
 * - save: platform 기준 upsert, min/latest/message/updated_by 갱신.
 */
describe('AppVersionRepository', () => {
  const query = jest.fn();
  const repository = new AppVersionRepository({ query } as unknown as DataSource);
  const sqlOf = (call: number) => String(query.mock.calls[call][0]).replace(/\s+/g, ' ');

  beforeEach(() => query.mockReset());

  it('ensureSchema — 멱등 DDL 과 기본 행', async () => {
    query.mockResolvedValue([]);
    await repository.ensureSchema();
    expect(sqlOf(0)).toContain(`CREATE TABLE IF NOT EXISTS artinfo_app_versions`);
    expect(sqlOf(0)).toContain(`min_version VARCHAR(32) NOT NULL DEFAULT '1.0'`);
    expect(sqlOf(1)).toBe(`INSERT INTO artinfo_app_versions (platform) VALUES ($1) ON CONFLICT (platform) DO NOTHING`);
    expect(query.mock.calls[1][1]).toEqual(['ios']);
    expect(query.mock.calls[2][1]).toEqual(['android']);
  });

  it('findByPlatform — 행을 돌려주고 없으면 null', async () => {
    const row = { platform: 'ios', minVersion: '1.1', latestVersion: null, message: null, updatedBy: null, updatedAt: new Date() };
    query.mockResolvedValueOnce([row]).mockResolvedValueOnce([]);
    await expect(repository.findByPlatform('ios')).resolves.toEqual(row);
    expect(query.mock.calls[0][1]).toEqual(['ios']);
    await expect(repository.findByPlatform('android')).resolves.toBeNull();
  });

  it('save — platform 기준 upsert', async () => {
    query.mockResolvedValue([]);
    await repository.save('android', { minVersion: '1.2', latestVersion: '1.3', message: '보안 수정' }, 7);
    expect(sqlOf(0)).toContain(
      `ON CONFLICT (platform) DO UPDATE SET min_version = EXCLUDED.min_version, latest_version = EXCLUDED.latest_version, message = EXCLUDED.message, updated_by = EXCLUDED.updated_by, updated_at = now()`,
    );
    expect(query.mock.calls[0][1]).toEqual(['android', '1.2', '1.3', '보안 수정', 7]);
  });
});
