import { OngiAdminInquiryUseCase } from '@/ongi/admin/application/usecase/ongi-admin.usecase';
import { IOngiAdminRepository, OngiAdminInquiryRow } from '@/ongi/admin/domain/repository/ongi-admin.repository.interface';
import { OngiAdminInvalidAnswer, OngiAdminNotFound } from '@/ongi/admin/domain/exception/ongi-admin.exception';
import { OngiPushService } from '@/ongi/push/application/service/ongi-push.service';

const inquiryOf = (answer: string | null): OngiAdminInquiryRow => ({
  id: 12,
  userId: 30,
  userName: '엄마',
  userEmail: 'mom@naver.com',
  content: '사진이 안 올라가요',
  answer,
  answeredByName: null,
  answeredAt: null,
  createdAt: new Date('2026-09-20T01:00:00Z'),
});

function setup(inquiry: OngiAdminInquiryRow | null) {
  const saved: { id: number; answer: string; adminUserId: number }[] = [];
  const pushed: { userIds: number[]; type: string }[] = [];
  const repository = {
    findInquiryById: async () => inquiry,
    answerInquiry: async (id: number, answer: string, adminUserId: number) => {
      saved.push({ id, answer, adminUserId });
    },
  } as unknown as IOngiAdminRepository;
  const pushService = {
    notifyUsers: (userIds: number[], message: { data: { type: string } }) => {
      pushed.push({ userIds, type: message.data.type });
    },
  } as unknown as OngiPushService;

  return { useCase: new OngiAdminInquiryUseCase(repository, pushService), saved, pushed };
}

const ACTOR = { userId: 7, type: 'ADMIN' } as const;

describe('OngiAdminInquiryUseCase.answer — 문의 답변 · 답변 없이 완료', () => {
  it('답변을 쓰면 저장하고 문의한 사용자에게 푸시', async () => {
    const { useCase, saved, pushed } = setup(inquiryOf(null));

    await useCase.answer(ACTOR, 12, '  확인해 보니 해결됐어요. ');

    expect(saved).toEqual([{ id: 12, answer: '확인해 보니 해결됐어요.', adminUserId: 7 }]);
    expect(pushed).toEqual([{ userIds: [30], type: 'inquiry_answered' }]);
  });

  it('아무것도 쓰지 않아도 완료 처리된다 — 빈 답변으로 저장, 푸시는 보내지 않는다', async () => {
    const { useCase, saved, pushed } = setup(inquiryOf(null));

    await useCase.answer(ACTOR, 12, '   ');

    expect(saved).toEqual([{ id: 12, answer: '', adminUserId: 7 }]);
    expect(pushed).toEqual([]);
  });

  it('답변 없이 완료했던 문의에 나중에 답변을 쓰면 그때 푸시', async () => {
    const { useCase, saved, pushed } = setup(inquiryOf(''));

    await useCase.answer(ACTOR, 12, '확인해 보니 해결됐어요.');

    expect(saved).toEqual([{ id: 12, answer: '확인해 보니 해결됐어요.', adminUserId: 7 }]);
    expect(pushed).toEqual([{ userIds: [30], type: 'inquiry_answered' }]);
  });

  it('이미 있는 답변을 고치면 푸시는 다시 보내지 않는다', async () => {
    const { useCase, saved, pushed } = setup(inquiryOf('처음 답변'));

    await useCase.answer(ACTOR, 12, '고친 답변');

    expect(saved).toEqual([{ id: 12, answer: '고친 답변', adminUserId: 7 }]);
    expect(pushed).toEqual([]);
  });

  it('2000자를 넘으면 거부하고 저장하지 않는다', async () => {
    const { useCase, saved } = setup(inquiryOf(null));

    await expect(useCase.answer(ACTOR, 12, '가'.repeat(2001))).rejects.toBeInstanceOf(OngiAdminInvalidAnswer);
    expect(saved).toEqual([]);
  });

  it('없는 문의면 찾을 수 없음', async () => {
    const { useCase, saved } = setup(null);

    await expect(useCase.answer(ACTOR, 12, '')).rejects.toBeInstanceOf(OngiAdminNotFound);
    expect(saved).toEqual([]);
  });
});
