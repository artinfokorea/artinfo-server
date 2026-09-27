import { OngiCreateReportUseCase } from '@/ongi/report/application/usecase/ongi-report.usecase';
import { ONGI_REPORT_TARGET_TYPE, OngiReportCreator } from '@/ongi/report/domain/entity/ongi-report.entity';
import { IOngiReportRepository } from '@/ongi/report/domain/repository/ongi-report.repository.interface';
import { OngiReportTargetNotFound } from '@/ongi/report/domain/exception/ongi-report.exception';
import { IOngiPhotoRepository } from '@/ongi/photo/domain/repository/ongi-photo.repository.interface';
import { IOngiMemberRepository } from '@/ongi/group/domain/repository/ongi-member.repository.interface';
import { IOngiChatRepository } from '@/ongi/chat/domain/repository/ongi-chat.repository.interface';

/** 메시지 7 은 방 3 (참여자 1·2, 3 은 나감), 메시지 8 은 1:1 방을 지운 뒤라 사용자 2 에게 안 보이는 메시지 */
function setup() {
  const created: OngiReportCreator[] = [];
  const reportRepository = { create: async (creator: OngiReportCreator) => created.push(creator) } as unknown as IOngiReportRepository;
  const chatRepository = {
    findMessageById: async (id: number) => (id === 7 || id === 8 ? { id, roomId: 3, senderUserId: 1 } : null),
    findParticipant: async (roomId: number, userId: number) => {
      if (roomId !== 3) return null;
      if (userId === 2) return { roomId, userId, leftAt: null, visibleFromMessageId: 7 };
      if (userId === 3) return { roomId, userId, leftAt: new Date(), visibleFromMessageId: 0 };
      return null;
    },
  } as unknown as IOngiChatRepository;

  const useCase = new OngiCreateReportUseCase(reportRepository, {} as IOngiPhotoRepository, {} as IOngiMemberRepository, chatRepository);

  return { useCase, created };
}

describe('OngiCreateReportUseCase — 채팅 메시지 신고', () => {
  it('그 방에 참여 중이고 볼 수 있는 메시지면 신고가 접수된다', async () => {
    const { useCase, created } = setup();

    await useCase.execute(2, { targetType: ONGI_REPORT_TARGET_TYPE.CHAT_MESSAGE, targetId: 8, reason: '욕설' });

    expect(created).toEqual([{ reporterUserId: 2, targetType: 'chat_message', targetId: 8, reason: '욕설' }]);
  });

  it('없는 메시지 · 참여자가 아님 · 나간 방 · 볼 수 없는 메시지는 대상 없음', async () => {
    const { useCase, created } = setup();
    const report = (userId: number, targetId: number) =>
      useCase.execute(userId, { targetType: ONGI_REPORT_TARGET_TYPE.CHAT_MESSAGE, targetId, reason: '욕설' });

    await expect(report(2, 99)).rejects.toBeInstanceOf(OngiReportTargetNotFound);
    await expect(report(9, 8)).rejects.toBeInstanceOf(OngiReportTargetNotFound);
    await expect(report(3, 8)).rejects.toBeInstanceOf(OngiReportTargetNotFound);
    await expect(report(2, 7)).rejects.toBeInstanceOf(OngiReportTargetNotFound);
    expect(created).toEqual([]);
  });
});
