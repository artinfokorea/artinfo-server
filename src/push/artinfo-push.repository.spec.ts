import { DataSource } from 'typeorm';
import { ArtinfoPushRepository } from '@/push/artinfo-push.repository';

/**
 * 기대값 (DB 없이 SQL 문자열로 확인, moderation spec 과 같은 방식)
 * - 토큰 등록: artinfo_push_tokens 에 (회원, 토큰, 플랫폼) upsert — 같은 토큰이 다른 계정으로 오면 주인을 바꾼다.
 * - 토큰 해제: 토큰으로 지운다. 죽은 토큰 일괄 삭제.
 * - 설정: artinfo_push_preferences 의 job 컬럼. 저장한 적 없으면 null → 호출부가 기본값(켜짐)으로 본다.
 * - 발송 대상: 탈퇴하지 않은 회원의 토큰 중 job 설정이 꺼지지 않은 것(저장 안 했으면 켜짐). 작성자 본인은 제외.
 */
describe('ArtinfoPushRepository', () => {
  const query = jest.fn().mockResolvedValue([]);
  const repository = new ArtinfoPushRepository({ query } as unknown as DataSource);
  const lastCall = () => query.mock.calls[query.mock.calls.length - 1];

  beforeEach(() => query.mockClear());

  it('upsertToken — 토큰 기준으로 넣고, 이미 있으면 회원·플랫폼을 갱신한다', async () => {
    await repository.upsertToken(7, 'ExponentPushToken[abc]', 'ios');
    const [sql, params] = lastCall();
    expect(sql).toContain('INSERT INTO artinfo_push_tokens');
    expect(sql).toContain('ON CONFLICT (token) DO UPDATE');
    expect(params).toEqual([7, 'ExponentPushToken[abc]', 'ios']);
  });

  it('deleteToken / deleteTokens — 토큰으로 지운다', async () => {
    await repository.deleteToken('ExponentPushToken[abc]');
    expect(lastCall()[0]).toContain('DELETE FROM artinfo_push_tokens WHERE token = $1');

    query.mockClear();
    await repository.deleteTokens([]);
    expect(query).not.toHaveBeenCalled();

    await repository.deleteTokens(['a', 'b']);
    const [sql, params] = lastCall();
    expect(sql).toContain('DELETE FROM artinfo_push_tokens WHERE token = ANY($1)');
    expect(params).toEqual([['a', 'b']]);
  });

  it('findPreferences — 저장한 적 없으면 null', async () => {
    query.mockResolvedValueOnce([]);
    await expect(repository.findPreferences(7)).resolves.toBeNull();

    query.mockResolvedValueOnce([{ job: false }]);
    await expect(repository.findPreferences(7)).resolves.toEqual({ job: false });
  });

  it('savePreferences — 회원당 한 행을 upsert 한다', async () => {
    await repository.savePreferences(7, { job: false });
    const [sql, params] = lastCall();
    expect(sql).toContain('INSERT INTO artinfo_push_preferences');
    expect(sql).toContain('ON CONFLICT (user_id) DO UPDATE');
    expect(params).toEqual([7, false]);
  });

  it('scanTokensForJobPush — 탈퇴 회원·알림 끈 회원·작성자 본인을 뺀 토큰 목록', async () => {
    query.mockResolvedValueOnce([{ token: 'ExponentPushToken[a]' }, { token: 'ExponentPushToken[b]' }]);
    const tokens = await repository.scanTokensForJobPush(7);
    expect(tokens).toEqual(['ExponentPushToken[a]', 'ExponentPushToken[b]']);
    const [sql, params] = lastCall();
    expect(sql).toContain('FROM artinfo_push_tokens');
    expect(sql).toContain('LEFT JOIN artinfo_push_preferences');
    expect(sql).toContain('deleted_at IS NULL');
    expect(sql).toContain('COALESCE(p.job, TRUE)');
    expect(params).toEqual([7]);
  });
});
