import { OngiInquiry } from '@/ongi/inquiry/domain/entity/ongi-inquiry.entity';
import { OngiInquiryResponse } from '@/ongi/inquiry/presentation/dto/response/ongi-inquiry.response';

const inquiryOf = (patch: Partial<OngiInquiry>) =>
  ({
    id: 12,
    userId: 7,
    content: '사진이 안 올라가요',
    answer: null,
    answeredAt: null,
    createdAt: new Date('2026-09-20T01:00:00Z'),
    ...patch,
  }) as OngiInquiry;

describe('OngiInquiryResponse — 앱에 내려가는 내 문의', () => {
  it('답변 전: open, answer 없음', () => {
    const response = new OngiInquiryResponse(inquiryOf({}));

    expect(response.status).toBe('open');
    expect(response.answer).toBeUndefined();
    expect(response.answeredAt).toBeUndefined();
  });

  it('답변 완료: answered, 답변과 답변 시각', () => {
    const response = new OngiInquiryResponse(inquiryOf({ answer: '확인해 보니 해결됐어요.', answeredAt: new Date('2026-09-21T02:00:00Z') }));

    expect(response.status).toBe('answered');
    expect(response.answer).toBe('확인해 보니 해결됐어요.');
    expect(response.answeredAt).toBe('2026-09-21T02:00:00.000Z');
  });

  it('답변 없이 완료: answered 이지만 answer 는 내려가지 않는다 (구버전 앱이 빈 답변 상자를 그리지 않게)', () => {
    const response = new OngiInquiryResponse(inquiryOf({ answer: '', answeredAt: new Date('2026-09-21T02:00:00Z') }));

    expect(response.status).toBe('answered');
    expect(response.answer).toBeUndefined();
    expect(response.answeredAt).toBe('2026-09-21T02:00:00.000Z');
  });
});
