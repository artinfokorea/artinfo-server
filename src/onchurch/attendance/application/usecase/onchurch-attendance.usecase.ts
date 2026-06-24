import { Inject, Injectable } from '@nestjs/common';
import {
  ONCHURCH_ATTENDANCE_REPOSITORY,
  IOnchurchAttendanceRepository,
  OnchurchAttendanceSessionCount,
} from '@/onchurch/attendance/domain/repository/onchurch-attendance.repository.interface';
import { OnchurchChurchManagerResolver } from '@/onchurch/church/application/service/onchurch-church-manager.resolver';
import { OnchurchAttendanceMarkCommand } from '@/onchurch/attendance/application/command/onchurch-attendance-mark.command';
import { OnchurchAttendanceChurchNotConfigured } from '@/onchurch/attendance/domain/exception/onchurch-attendance.exception';

@Injectable()
export class OnchurchGetAttendanceSessionUseCase {
  constructor(
    @Inject(ONCHURCH_ATTENDANCE_REPOSITORY) private readonly repo: IOnchurchAttendanceRepository,
    private readonly managerResolver: OnchurchChurchManagerResolver,
  ) {}
  async execute(userId: number, date: string, serviceType: string): Promise<number[]> {
    const church = await this.managerResolver.resolveManagedChurch(userId);
    if (!church) return [];
    return this.repo.findPresentSaintIds(church.id, date, serviceType);
  }
}

@Injectable()
export class OnchurchMarkAttendanceUseCase {
  constructor(
    @Inject(ONCHURCH_ATTENDANCE_REPOSITORY) private readonly repo: IOnchurchAttendanceRepository,
    private readonly managerResolver: OnchurchChurchManagerResolver,
  ) {}
  async execute(userId: number, command: OnchurchAttendanceMarkCommand): Promise<void> {
    const church = await this.managerResolver.resolveManagedChurch(userId);
    if (!church) throw new OnchurchAttendanceChurchNotConfigured();

    const existing = await this.repo.findOne(church.id, command.saintId, command.date, command.serviceType);
    if (command.present) {
      if (!existing) await this.repo.create(church.id, command.saintId, command.date, command.serviceType);
    } else if (existing) {
      await this.repo.removeById(church.id, existing.id);
    }
  }
}

@Injectable()
export class OnchurchListAttendanceSessionsUseCase {
  constructor(
    @Inject(ONCHURCH_ATTENDANCE_REPOSITORY) private readonly repo: IOnchurchAttendanceRepository,
    private readonly managerResolver: OnchurchChurchManagerResolver,
  ) {}
  async execute(userId: number): Promise<OnchurchAttendanceSessionCount[]> {
    const church = await this.managerResolver.resolveManagedChurch(userId);
    if (!church) return [];
    return this.repo.listSessions(church.id);
  }
}
