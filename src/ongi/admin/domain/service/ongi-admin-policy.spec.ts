import {
  adminTypeOfSession,
  canGrantUserType,
  fillDailySeries,
  hasAdminPermission,
  isValidAdminConfig,
  maskEmail,
} from '@/ongi/admin/domain/service/ongi-admin-policy';

describe('adminTypeOfSession — 관리자 API 를 쓰는 사람의 등급', () => {
  it('온기 로그인 세션이 있으면 사용자 타입을 돌려준다', () => {
    expect(adminTypeOfSession({ tokenUserId: 7, session: { userId: 7 }, user: { type: 'SUPER_ADMIN', deletedAt: null } })).toBe('SUPER_ADMIN');
    expect(adminTypeOfSession({ tokenUserId: 7, session: { userId: 7 }, user: { type: 'ADMIN', deletedAt: null } })).toBe('ADMIN');
  });

  it('일반 사용자(USER)는 null', () => {
    expect(adminTypeOfSession({ tokenUserId: 7, session: { userId: 7 }, user: { type: 'USER', deletedAt: null } })).toBeNull();
  });

  it('모르는 타입 값은 null', () => {
    expect(adminTypeOfSession({ tokenUserId: 7, session: { userId: 7 }, user: { type: 'admin', deletedAt: null } })).toBeNull();
  });

  it('ongi_auths 에 없는 토큰은 null — 같은 JWT 키를 쓰는 다른 서비스 토큰의 id 가 우연히 겹쳐도 통과하면 안 된다', () => {
    expect(adminTypeOfSession({ tokenUserId: 7, session: null, user: { type: 'SUPER_ADMIN', deletedAt: null } })).toBeNull();
  });

  it('세션의 사용자와 토큰의 사용자가 다르면 null', () => {
    expect(adminTypeOfSession({ tokenUserId: 7, session: { userId: 8 }, user: { type: 'SUPER_ADMIN', deletedAt: null } })).toBeNull();
  });

  it('탈퇴했거나 없는 사용자는 null', () => {
    expect(
      adminTypeOfSession({ tokenUserId: 7, session: { userId: 7 }, user: { type: 'SUPER_ADMIN', deletedAt: new Date('2026-09-01T00:00:00Z') } }),
    ).toBeNull();
    expect(adminTypeOfSession({ tokenUserId: 7, session: { userId: 7 }, user: null })).toBeNull();
  });
});

describe('hasAdminPermission — 등급별 권한', () => {
  it('ADMIN: 대시보드 · 신고 처리 · 문의 답변 · 사용자/가족 공간 조회', () => {
    expect(hasAdminPermission('ADMIN', 'inquiries')).toBe(true);
    expect(hasAdminPermission('ADMIN', 'dashboard')).toBe(true);
    expect(hasAdminPermission('ADMIN', 'reports')).toBe(true);
    expect(hasAdminPermission('ADMIN', 'directory')).toBe(true);
  });

  it('ADMIN: 앱 버전 설정 · 관리자 지정 · 민감 정보(이메일 원문 등)는 불가', () => {
    expect(hasAdminPermission('ADMIN', 'configs')).toBe(false);
    expect(hasAdminPermission('ADMIN', 'grant')).toBe(false);
    expect(hasAdminPermission('ADMIN', 'sensitive')).toBe(false);
  });

  it('ADMIN: 가족 사진 열람은 불가 (신고된 사진은 reports 로 본다)', () => {
    expect(hasAdminPermission('ADMIN', 'photos')).toBe(false);
  });

  it('SUPER_ADMIN: 전부 가능', () => {
    expect(hasAdminPermission('SUPER_ADMIN', 'dashboard')).toBe(true);
    expect(hasAdminPermission('SUPER_ADMIN', 'reports')).toBe(true);
    expect(hasAdminPermission('SUPER_ADMIN', 'directory')).toBe(true);
    expect(hasAdminPermission('SUPER_ADMIN', 'configs')).toBe(true);
    expect(hasAdminPermission('SUPER_ADMIN', 'grant')).toBe(true);
    expect(hasAdminPermission('SUPER_ADMIN', 'sensitive')).toBe(true);
    expect(hasAdminPermission('SUPER_ADMIN', 'photos')).toBe(true);
    expect(hasAdminPermission('SUPER_ADMIN', 'inquiries')).toBe(true);
  });
});

describe('canGrantUserType — 관리자 화면에서 사용자 등급 변경', () => {
  it('일반 사용자를 ADMIN 으로, ADMIN 을 일반 사용자로 바꿀 수 있다', () => {
    expect(canGrantUserType({ actorUserId: 1, targetUserId: 2, targetCurrentType: 'USER', nextType: 'ADMIN' })).toBe(true);
    expect(canGrantUserType({ actorUserId: 1, targetUserId: 2, targetCurrentType: 'ADMIN', nextType: 'USER' })).toBe(true);
  });

  it('SUPER_ADMIN 은 화면에서 만들 수 없다 — DB 에서만 지정', () => {
    expect(canGrantUserType({ actorUserId: 1, targetUserId: 2, targetCurrentType: 'ADMIN', nextType: 'SUPER_ADMIN' })).toBe(false);
  });

  it('SUPER_ADMIN 의 등급은 화면에서 내릴 수 없다', () => {
    expect(canGrantUserType({ actorUserId: 1, targetUserId: 2, targetCurrentType: 'SUPER_ADMIN', nextType: 'USER' })).toBe(false);
  });

  it('자기 자신의 등급은 바꿀 수 없다', () => {
    expect(canGrantUserType({ actorUserId: 1, targetUserId: 1, targetCurrentType: 'ADMIN', nextType: 'USER' })).toBe(false);
  });

  it('모르는 등급 값은 거부', () => {
    expect(canGrantUserType({ actorUserId: 1, targetUserId: 2, targetCurrentType: 'USER', nextType: 'MANAGER' })).toBe(false);
  });
});

describe('isValidAdminConfig — 관리자 화면에서 바꿀 수 있는 설정', () => {
  it('앱 버전 키 4개에 x.y.z 형식 값만 허용', () => {
    expect(isValidAdminConfig('min_ios_version', '1.0.7')).toBe(true);
    expect(isValidAdminConfig('latest_ios_version', '1.10.0')).toBe(true);
    expect(isValidAdminConfig('min_android_version', '1.0.2')).toBe(true);
    expect(isValidAdminConfig('latest_android_version', '2.0.0')).toBe(true);
  });

  it('형식이 틀린 버전은 거부', () => {
    expect(isValidAdminConfig('min_ios_version', '1.0')).toBe(false);
    expect(isValidAdminConfig('min_ios_version', 'v1.0.7')).toBe(false);
    expect(isValidAdminConfig('min_ios_version', '1.0.7 ')).toBe(false);
    expect(isValidAdminConfig('min_ios_version', '')).toBe(false);
  });

  it('목록에 없는 키는 거부', () => {
    expect(isValidAdminConfig('store_url', '1.0.0')).toBe(false);
  });
});

describe('fillDailySeries — 최근 N일 일별 건수 (빈 날은 0)', () => {
  it('오늘 포함 N일을 오래된 날부터 채운다', () => {
    expect(
      fillDailySeries(
        [
          { day: '2026-09-12', count: 3 },
          { day: '2026-09-14', count: 1 },
        ],
        '2026-09-14',
        4,
      ),
    ).toEqual([
      { day: '2026-09-11', count: 0 },
      { day: '2026-09-12', count: 3 },
      { day: '2026-09-13', count: 0 },
      { day: '2026-09-14', count: 1 },
    ]);
  });

  it('월이 바뀌어도 날짜가 이어진다', () => {
    expect(fillDailySeries([], '2026-10-01', 3)).toEqual([
      { day: '2026-09-29', count: 0 },
      { day: '2026-09-30', count: 0 },
      { day: '2026-10-01', count: 0 },
    ]);
  });

  it('범위 밖 날짜는 버린다', () => {
    expect(fillDailySeries([{ day: '2026-09-01', count: 9 }], '2026-09-14', 1)).toEqual([{ day: '2026-09-14', count: 0 }]);
  });
});

describe('maskEmail — 민감 정보 권한이 없는 관리자에게 보이는 이메일', () => {
  it('아이디 앞 2글자만 남기고 가린다', () => {
    expect(maskEmail('joel.kim@gmail.com')).toBe('jo***@gmail.com');
  });

  it('아이디가 2글자 이하면 첫 글자만 남긴다', () => {
    expect(maskEmail('ab@naver.com')).toBe('a***@naver.com');
    expect(maskEmail('a@naver.com')).toBe('a***@naver.com');
  });

  it('형식이 이상하거나 없으면 가린 표시만', () => {
    expect(maskEmail('not-an-email')).toBe('***');
    expect(maskEmail(null)).toBeNull();
  });
});
