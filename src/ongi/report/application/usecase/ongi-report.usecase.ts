import { Inject, Injectable } from '@nestjs/common';
import { IOngiReportRepository, ONGI_REPORT_REPOSITORY } from '@/ongi/report/domain/repository/ongi-report.repository.interface';
import { IOngiPhotoRepository, ONGI_PHOTO_REPOSITORY } from '@/ongi/photo/domain/repository/ongi-photo.repository.interface';
import { IOngiMemberRepository, ONGI_MEMBER_REPOSITORY } from '@/ongi/group/domain/repository/ongi-member.repository.interface';
import { ONGI_REPORT_TARGET_TYPE } from '@/ongi/report/domain/entity/ongi-report.entity';
import { OngiReportTargetNotFound } from '@/ongi/report/domain/exception/ongi-report.exception';
import { OngiNotGroupMember } from '@/ongi/group/domain/exception/ongi-group.exception';

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
  ) {}

  /** 신고 접수 — 대상이 존재하고, 신고자가 대상이 속한 그룹의 구성원이어야 한다 */
  async execute(userId: number, command: OngiCreateReportCommand): Promise<void> {
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
    }
  }
}
