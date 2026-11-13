import { DataSource } from 'typeorm';
import { AdminUsersRepository } from '@/admin/repository/admin-users.repository';

/**
 * 기대값 (DB 없이 SQL 문자열로 확인):
 * - summary: 회원 수는 탈퇴·관리자 제외, 앱 회원은 artinfo_push_tokens 기준, push_on 은 COALESCE(job, TRUE).
 * - findUsers: 검색어가 있으면 닉네임·이름·이메일 ILIKE, LIMIT/OFFSET 은 (page-1)*size, 총 개수 쿼리 먼저.
 * - findUsers: 검색어가 없으면 파라미터는 LIMIT·OFFSET 만.
 * - withdraw: 익명화 + deleted_at + 푸시 토큰 삭제가 한 트랜잭션.
 */
describe('AdminUsersRepository', () => {
  const query = jest.fn();
  const managerQuery = jest.fn().mockResolvedValue(undefined);
  const transaction = jest.fn(async (fn: (m: { query: typeof managerQuery }) => Promise<void>) => fn({ query: managerQuery }));
  const repository = new AdminUsersRepository({ query, transaction } as unknown as DataSource);
  const sqlOf = (call: number) => String(query.mock.calls[call][0]).replace(/\s+/g, ' ');

  beforeEach(() => {
    query.mockReset();
    managerQuery.mockClear();
    transaction.mockClear();
  });

  it('summary — 회원은 탈퇴·관리자 제외, 앱 회원은 푸시 토큰 기준', async () => {
    query.mockResolvedValue([{ members: 10, app_users: 3 }]);
    const row = await repository.summary();
    expect(row).toEqual({ members: 10, app_users: 3 });
    const sql = sqlOf(0);
    expect(sql).toContain(`FROM users u WHERE u.deleted_at IS NULL AND u.type <> 'ADMIN')::int AS members`);
    expect(sql).toContain(`FROM artinfo_push_tokens t JOIN users u ON u.id = t.user_id AND u.deleted_at IS NULL AND u.type <> 'ADMIN' GROUP BY t.user_id`);
    expect(sql).toContain(`COALESCE((SELECT p.job FROM artinfo_push_preferences p WHERE p.user_id = a.user_id), TRUE) = TRUE)::int AS push_on`);
    expect(sql).toContain(`bool_or(t.platform = 'ios') AS has_ios`);
  });

  it('findUsers — 검색어가 있으면 ILIKE $1, LIMIT $2 OFFSET $3 = (page-1)*size', async () => {
    query.mockResolvedValueOnce([{ total: 42 }]).mockResolvedValueOnce([{ id: 1 }]);
    const result = await repository.findUsers('app', '홍길', 3, 20);
    expect(result).toEqual({ total: 42, rows: [{ id: 1 }] });
    expect(sqlOf(0)).toBe(
      `SELECT count(*)::int AS total FROM users u WHERE u.deleted_at IS NULL AND EXISTS (SELECT 1 FROM artinfo_push_tokens t WHERE t.user_id = u.id) AND (u.nickname ILIKE $1 OR u.name ILIKE $1 OR u.email ILIKE $1)`,
    );
    expect(query.mock.calls[0][1]).toEqual(['%홍길%']);
    expect(sqlOf(1)).toContain(`ORDER BY u.created_at DESC, u.id DESC LIMIT $2 OFFSET $3`);
    expect(query.mock.calls[1][1]).toEqual(['%홍길%', 20, 40]);
  });

  it('findUsers — 검색어가 없으면 LIMIT $1 OFFSET $2, 첫 페이지 OFFSET 0', async () => {
    query.mockResolvedValueOnce([{ total: 0 }]).mockResolvedValueOnce([]);
    await repository.findUsers('all', null, 1, 50);
    expect(sqlOf(0)).toBe(`SELECT count(*)::int AS total FROM users u WHERE u.deleted_at IS NULL`);
    expect(query.mock.calls[0][1]).toEqual([]);
    expect(sqlOf(1)).toContain(`LIMIT $1 OFFSET $2`);
    expect(query.mock.calls[1][1]).toEqual([50, 0]);
  });

  it('findUsers — 행에 마지막 로그인·로그인 방식·기기 수·플랫폼·채용 알림이 들어간다', async () => {
    query.mockResolvedValueOnce([{ total: 0 }]).mockResolvedValueOnce([]);
    await repository.findUsers('all', null, 1, 20);
    const sql = sqlOf(1);
    expect(sql).toContain(`(SELECT max(a.created_at) FROM auths a WHERE a.user_id = u.id) AS "lastLoginAt"`);
    expect(sql).toContain(`array_agg(DISTINCT a.type::text) FROM auths a WHERE a.user_id = u.id), '{}') AS "loginTypes"`);
    expect(sql).toContain(`(SELECT count(*)::int FROM artinfo_push_tokens t WHERE t.user_id = u.id) AS "deviceCount"`);
    expect(sql).toContain(`array_agg(DISTINCT t.platform) FROM artinfo_push_tokens t WHERE t.user_id = u.id), '{}') AS platforms`);
    expect(sql).toContain(`COALESCE((SELECT p.job FROM artinfo_push_preferences p WHERE p.user_id = u.id), TRUE) AS "pushJob"`);
  });

  it('updateType — type 과 updated_at 을 바꾼다', async () => {
    query.mockResolvedValue([]);
    await repository.updateType(7, 'ADMIN');
    expect(sqlOf(0)).toBe(`UPDATE users SET type = $2, updated_at = now() WHERE id = $1`);
    expect(query.mock.calls[0][1]).toEqual([7, 'ADMIN']);
  });

  it('withdraw — 익명화·soft delete·푸시 토큰 삭제를 한 트랜잭션으로', async () => {
    await repository.withdraw(7);
    expect(transaction).toHaveBeenCalledTimes(1);
    const first = String(managerQuery.mock.calls[0][0]).replace(/\s+/g, ' ');
    expect(first).toContain(
      `SET name = '탈퇴회원', nickname = '탈퇴회원', email = $2, phone = NULL, birth = NULL, password = NULL, icon_image_url = NULL, deleted_at = now()`,
    );
    expect(first).toContain(`WHERE id = $1 AND deleted_at IS NULL`);
    expect(managerQuery.mock.calls[0][1][0]).toBe(7);
    expect(managerQuery.mock.calls[0][1][1]).toMatch(/^withdrawn-7-\d+@withdrawn\.artinfokorea\.com$/);
    expect(String(managerQuery.mock.calls[1][0])).toBe(`DELETE FROM artinfo_push_tokens WHERE user_id = $1`);
  });
});
