import { normalizeUserSort } from '@/ongi/admin/domain/service/ongi-admin-policy';
import { toAdminUserItem } from '@/ongi/admin/presentation/dto/response/ongi-admin.response';
import { OngiAdminUserRow } from '@/ongi/admin/domain/repository/ongi-admin.repository.interface';

describe('normalizeUserSort — 사용자 목록 정렬', () => {
  it("'seen' 이면 마지막 접속 순", () => {
    expect(normalizeUserSort('seen')).toBe('seen');
  });

  it('그 밖에는 전부 가입 순(기본)', () => {
    expect(normalizeUserSort('joined')).toBe('joined');
    expect(normalizeUserSort(undefined)).toBe('joined');
    expect(normalizeUserSort('')).toBe('joined');
    expect(normalizeUserSort('last_seen_at; DROP TABLE ongi_users')).toBe('joined');
  });
});

const userOf = (overrides: Partial<OngiAdminUserRow> = {}): OngiAdminUserRow => ({
  id: 30,
  name: '엄마',
  email: 'mom@naver.com',
  snsType: 'kakao',
  type: 'USER',
  isTest: false,
  createdAt: new Date('2026-09-20T01:00:00Z'),
  deletedAt: null,
  lastSeenAt: new Date('2026-09-29T09:30:00Z'),
  groupCount: 2,
  photoCount: 4,
  groups: [
    { groupId: 1, groupName: '우리 가족', memberName: '엄마', role: 'admin' },
    { groupId: 7, groupName: '대학 동기', memberName: '지영', role: 'member' },
  ],
  ...overrides,
});

describe('사용자 응답 — 마지막 접속 · 소속 공간', () => {
  it('마지막 접속 시각을 ISO 문자열로 내려준다', () => {
    expect(toAdminUserItem(userOf()).lastSeenAt).toBe('2026-09-29T09:30:00.000Z');
  });

  it('접속 기록이 없으면 null — 기록을 시작한 뒤로 접속하지 않은 사용자', () => {
    expect(toAdminUserItem(userOf({ lastSeenAt: null })).lastSeenAt).toBeNull();
  });

  it('소속 공간을 목록에서 바로 보여준다 — id 는 문자열', () => {
    expect(toAdminUserItem(userOf()).groups).toEqual([
      { groupId: '1', groupName: '우리 가족', memberName: '엄마', role: 'admin' },
      { groupId: '7', groupName: '대학 동기', memberName: '지영', role: 'member' },
    ]);
  });

  it('소속 공간이 없으면 빈 배열', () => {
    expect(toAdminUserItem(userOf({ groups: [], groupCount: 0 })).groups).toEqual([]);
  });
});
