import { DataSource } from 'typeorm';
import { ArtinfoModerationRepository } from '@/moderation/artinfo-moderation.repository';

/**
 * 기대값 (DB 없이 SQL 문자열로 확인, admin-stats spec 과 같은 방식)
 * - 신고: artinfo_reports 에 (신고자, 대상 종류, 대상 ID, 사유) 를 넣는다. 같은 사람이 같은 대상을 다시 신고하면 중복 저장하지 않는다.
 * - 차단: artinfo_blocks 에 (차단자, 차단 대상) 을 넣고, 이미 있으면 무시한다. 자기 자신은 차단할 수 없다.
 * - 차단 해제: 행을 지운다. 차단 목록: 차단 대상 ID 배열.
 */
describe('ArtinfoModerationRepository', () => {
  const query = jest.fn().mockResolvedValue([]);
  const repository = new ArtinfoModerationRepository({ query } as unknown as DataSource);
  const lastCall = () => query.mock.calls[query.mock.calls.length - 1];

  beforeEach(() => query.mockClear());

  it('report — 신고자·대상·사유를 저장하고 같은 대상 재신고는 무시한다', async () => {
    await repository.report({ reporterUserId: 7, targetType: 'POST', targetId: 31, reason: 'SPAM' });
    const [sql, params] = lastCall();
    expect(sql).toContain('INSERT INTO artinfo_reports');
    expect(sql).toContain('ON CONFLICT (reporter_user_id, target_type, target_id) DO NOTHING');
    expect(params).toEqual([7, 'POST', 31, 'SPAM']);
  });

  it('block — 차단을 저장하고 중복은 무시한다', async () => {
    await repository.block(7, 9);
    const [sql, params] = lastCall();
    expect(sql).toContain('INSERT INTO artinfo_blocks');
    expect(sql).toContain('ON CONFLICT (user_id, blocked_user_id) DO NOTHING');
    expect(params).toEqual([7, 9]);
  });

  it('unblock — 차단 행을 지운다', async () => {
    await repository.unblock(7, 9);
    const [sql, params] = lastCall();
    expect(sql).toContain('DELETE FROM artinfo_blocks');
    expect(params).toEqual([7, 9]);
  });

  it('blockedUserIds — 차단한 사용자 ID 배열을 돌려준다', async () => {
    query.mockResolvedValueOnce([{ blocked_user_id: 9 }, { blocked_user_id: 12 }]);
    await expect(repository.blockedUserIds(7)).resolves.toEqual([9, 12]);
    expect(lastCall()[1]).toEqual([7]);
  });

  it('ensureSchema — 테이블·유니크 인덱스를 멱등하게 만든다', async () => {
    await repository.ensureSchema();
    const all = query.mock.calls.map(c => String(c[0])).join('\n');
    expect(all).toContain('CREATE TABLE IF NOT EXISTS artinfo_reports');
    expect(all).toContain('CREATE TABLE IF NOT EXISTS artinfo_blocks');
    expect(all).toContain('CREATE UNIQUE INDEX IF NOT EXISTS uidx_artinfo_reports_reporter_target');
    expect(all).toContain('CREATE UNIQUE INDEX IF NOT EXISTS uidx_artinfo_blocks_user_blocked');
  });
});
