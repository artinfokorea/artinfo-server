import { Inject, Injectable } from '@nestjs/common';
import { IOngiReportRepository, ONGI_REPORT_REPOSITORY } from '@/ongi/report/domain/repository/ongi-report.repository.interface';
import { IOngiPhotoRepository, ONGI_PHOTO_REPOSITORY } from '@/ongi/photo/domain/repository/ongi-photo.repository.interface';
import { IOngiMemberRepository, ONGI_MEMBER_REPOSITORY } from '@/ongi/group/domain/repository/ongi-member.repository.interface';
import { ONGI_REPORT_TARGET_TYPE } from '@/ongi/report/domain/entity/ongi-report.entity';
import { OngiReportTargetNotFound } from '@/ongi/report/domain/exception/ongi-report.exception';
import { OngiNotGroupMember } from '@/ongi/group/domain/exception/ongi-group.exception';
import { IOngiChatRepository, ONGI_CHAT_REPOSITORY } from '@/ongi/chat/domain/repository/ongi-chat.repository.interface';

export interface OngiCreateReportCommand {
  targetType: ONGI_REPORT_TARGET_TYPE;
  targetId: number;
  reason: string;
}

@Injectable()
export class OngiCreateReportUseCase {
  constructor(
    @Inject(ONGI_REPORT_REPOSITORY)
    private readonly reportRepository: IOngiReportRepository,

    @Inject(ONGI_PHOTO_REPOSITORY)
    private readonly photoRepository: IOngiPhotoRepository,

    @Inject(ONGI_MEMBER_REPOSITORY)
    private readonly memberRepository: IOngiMemberRepository,

    @Inject(ONGI_CHAT_REPOSITORY)
    private readonly chatRepository: IOngiChatRepository,
  ) {}

  /** 신고 접수 — 대상이 존재하고, 신고자가 대상이 속한 그룹의 구성원(채팅 메시지는 그 방의 참여자)이어야 한다 */
  async execute(userId: number, command: OngiCreateReportCommand): Promise<void> {
    if (command.targetType === ONGI_REPORT_TARGET_TYPE.CHAT_MESSAGE) {
      await this.requireVisibleChatMessage(userId, command.targetId);
      await this.reportRepository.create({ reporterUserId: userId, targetType: command.targetType, targetId: command.targetId, reason: command.reason });

      return;
    }

    const groupId = await this.resolveGroupId(command.targetType, command.targetId);

    const me = await this.memberRepository.findByGroupIdAndUserId(groupId, userId);
    if (!me) throw new OngiNotGroupMember();

    await this.reportRepository.create({
      reporterUserId: userId,
      targetType: command.targetType,
      targetId: command.targetId,
      reason: command.reason,
    });
  }

  /** 채팅 메시지 — 지금 그 방에 참여 중이고 내가 볼 수 있는 메시지여야 한다 */
  private async requireVisibleChatMessage(userId: number, messageId: number): Promise<void> {
    const message = await this.chatRepository.findMessageById(messageId);
    const participant = message ? await this.chatRepository.findParticipant(message.roomId, userId) : null;
    if (!message || !participant || participant.leftAt || message.id <= participant.visibleFromMessageId) throw new OngiReportTargetNotFound();
  }

  private async resolveGroupId(targetType: ONGI_REPORT_TARGET_TYPE, targetId: number): Promise<number> {
    switch (targetType) {
      case ONGI_REPORT_TARGET_TYPE.PHOTO: {
        const photo = await this.photoRepository.findById(targetId);
        if (!photo) throw new OngiReportTargetNotFound();

        return photo.groupId;
      }
      case ONGI_REPORT_TARGET_TYPE.COMMENT: {
        const comment = await this.photoRepository.findCommentById(targetId);
        if (!comment) throw new OngiReportTargetNotFound();
        const photo = await this.photoRepository.findById(comment.photoId);
        if (!photo) throw new OngiReportTargetNotFound();

        return photo.groupId;
      }
      case ONGI_REPORT_TARGET_TYPE.MEMBER: {
        const member = await this.memberRepository.findById(targetId);
        if (!member) throw new OngiReportTargetNotFound();

        return member.groupId;
      }
      case ONGI_REPORT_TARGET_TYPE.CHAT_MESSAGE:
        throw new OngiReportTargetNotFound();
    }
  }
}
