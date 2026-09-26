import { NOTIFICATION_RETENTION_DAYS, notificationRecordsOf, notificationRetentionCutoff } from '@/ongi/notification/domain/service/ongi-notification';

describe('앱 내 알림 목록', () => {
  describe('notificationRecordsOf — 푸시 한 건을 수신자별 알림 행으로', () => {
    const message = { title: '온기', body: '민수님이 사진 3장을 올렸어요', data: { type: 'photo', groupId: '7', photoId: '99' } };

    it('수신자마다 한 행, 종류는 data.type, 행위자 id 를 함께 남긴다', () => {
      expect(notificationRecordsOf(message, [1, 2], 5)).toEqual([
        { userId: 1, type: 'photo', title: '온기', body: '민수님이 사진 3장을 올렸어요', data: { type: 'photo', groupId: '7', photoId: '99' }, actorUserId: 5 },
        { userId: 2, type: 'photo', title: '온기', body: '민수님이 사진 3장을 올렸어요', data: { type: 'photo', groupId: '7', photoId: '99' }, actorUserId: 5 },
      ]);
    });

    it('행위자 본인은 빠지고, 같은 사람은 한 번만', () => {
      expect(notificationRecordsOf(message, [5, 1, 1, 2], 5).map(r => r.userId)).toEqual([1, 2]);
    });

    it('행위자가 없는 시스템 알림(일정 리마인더·문의 답변)은 actorUserId 가 null', () => {
      const [record] = notificationRecordsOf({ title: '온기', body: '답변이 등록됐어요', data: { type: 'inquiry_answered', inquiryId: '3' } }, [1], null);
      expect(record.actorUserId).toBeNull();
      expect(record.type).toBe('inquiry_answered');
    });

    it('data 가 없으면 종류는 system, data 는 빈 객체', () => {
      const [record] = notificationRecordsOf({ title: '온기', body: '안내' }, [1], null);
      expect(record.type).toBe('system');
      expect(record.data).toEqual({});
    });

    it('수신자가 없으면 빈 배열', () => {
      expect(notificationRecordsOf(message, [], 5)).toEqual([]);
      expect(notificationRecordsOf(message, [5], 5)).toEqual([]);
    });
  });

  describe('notificationRetentionCutoff — 30일 지난 알림은 목록에서 빠지고 지워진다', () => {
    it('보관 기간은 30일', () => {
      expect(NOTIFICATION_RETENTION_DAYS).toBe(30);
    });

    it('기준 시각에서 정확히 30일 전', () => {
      expect(notificationRetentionCutoff(new Date('2026-09-26T10:00:00Z'))).toEqual(new Date('2026-08-27T10:00:00Z'));
    });
  });
});
