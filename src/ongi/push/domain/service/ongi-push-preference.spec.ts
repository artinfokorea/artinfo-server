import {
  DEFAULT_PUSH_PREFERENCES,
  ONGI_PUSH_CATEGORIES,
  allowsPushCategory,
  filterUserIdsByPreference,
  mergePushPreferences,
} from '@/ongi/push/domain/service/ongi-push-preference';

describe('푸시 알림 세부 설정', () => {
  it('카테고리는 사진·한마디·좋아요·일정·가족 소식 다섯 가지', () => {
    expect(ONGI_PUSH_CATEGORIES).toEqual(['photo', 'comment', 'like', 'event', 'family']);
  });

  it('기본값은 전부 켜짐', () => {
    expect(DEFAULT_PUSH_PREFERENCES).toEqual({ photo: true, comment: true, like: true, event: true, family: true });
  });

  describe('allowsPushCategory — 이 사용자에게 이 종류의 푸시를 보내도 되는가', () => {
    it('설정을 저장한 적 없으면(null) 모두 허용', () => {
      expect(allowsPushCategory(null, 'comment')).toBe(true);
    });

    it('카테고리 없는 알림(문의 답변·운영)은 설정과 무관하게 항상 허용', () => {
      expect(allowsPushCategory({ ...DEFAULT_PUSH_PREFERENCES, photo: false, comment: false, like: false, event: false, family: false }, undefined)).toBe(true);
    });

    it('끈 카테고리는 막힌다', () => {
      expect(allowsPushCategory({ ...DEFAULT_PUSH_PREFERENCES, like: false }, 'like')).toBe(false);
    });

    it('다른 카테고리를 껐어도 켜 둔 카테고리는 온다', () => {
      expect(allowsPushCategory({ ...DEFAULT_PUSH_PREFERENCES, like: false }, 'comment')).toBe(true);
    });
  });

  describe('mergePushPreferences — 일부만 바꾼 요청을 현재 설정에 덮어쓴다', () => {
    it('보낸 항목만 바뀌고 나머지는 유지', () => {
      expect(mergePushPreferences({ ...DEFAULT_PUSH_PREFERENCES, like: false }, { comment: false })).toEqual({
        photo: true,
        comment: false,
        like: false,
        event: true,
        family: true,
      });
    });

    it('현재 설정이 없으면(null) 기본값 위에 덮어쓴다', () => {
      expect(mergePushPreferences(null, { event: false })).toEqual({ photo: true, comment: true, like: true, event: false, family: true });
    });

    it('undefined 값은 무시한다 (요청 DTO 의 빠진 필드)', () => {
      expect(mergePushPreferences(DEFAULT_PUSH_PREFERENCES, { photo: undefined, family: false })).toEqual({
        photo: true,
        comment: true,
        like: true,
        event: true,
        family: false,
      });
    });
  });

  describe('filterUserIdsByPreference — 수신자 목록에서 그 종류를 끈 사람을 뺀다', () => {
    const saved = new Map([
      [2, { ...DEFAULT_PUSH_PREFERENCES, comment: false }],
      [3, { ...DEFAULT_PUSH_PREFERENCES, like: false }],
    ]);

    it('설정이 없는 사용자(1)는 남고, 댓글을 끈 사용자(2)는 빠지고, 다른 걸 끈 사용자(3)는 남는다', () => {
      expect(filterUserIdsByPreference([1, 2, 3], saved, 'comment')).toEqual([1, 3]);
    });

    it('카테고리가 없으면 아무도 빠지지 않는다', () => {
      expect(filterUserIdsByPreference([1, 2, 3], saved, undefined)).toEqual([1, 2, 3]);
    });

    it('순서는 유지된다', () => {
      expect(filterUserIdsByPreference([3, 1, 2], saved, 'like')).toEqual([1, 2]);
    });
  });
});
