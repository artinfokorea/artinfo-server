import { Inject, Injectable } from '@nestjs/common';
import {
  ONCHURCH_WORSHIP_SERVICE_REPOSITORY,
  IOnchurchWorshipServiceRepository,
} from '@/onchurch/worship/domain/repository/onchurch-worship-service.repository.interface';
import { OnchurchChurchManagerResolver } from '@/onchurch/church/application/service/onchurch-church-manager.resolver';
import { OnchurchWorshipService } from '@/onchurch/worship/domain/entity/onchurch-worship-service.entity';
import { OnchurchWorshipServiceWriteCommand } from '@/onchurch/worship/application/command/onchurch-worship-write.command';
import {
  OnchurchWorshipChurchNotConfigured,
  OnchurchWorshipServiceNotFound,
} from '@/onchurch/worship/domain/exception/onchurch-worship.exception';
import { OnchurchChurchRequiredService } from '@/onchurch/church/application/service/onchurch-church-required.service';
import {
  ONCHURCH_ATTENDANCE_REPOSITORY,
  IOnchurchAttendanceRepository,
} from '@/onchurch/attendance/domain/repository/onchurch-attendance.repository.interface';

@Injectable()
export class OnchurchListMyWorshipServicesUseCase {
  constructor(
    @Inject(ONCHURCH_WORSHIP_SERVICE_REPOSITORY) private readonly repo: IOnchurchWorshipServiceRepository,
    private readonly managerResolver: OnchurchChurchManagerResolver,
  ) {}
  async execute(userId: number): Promise<OnchurchWorshipService[]> {
    const church = await this.managerResolver.resolveManagedChurch(userId);
    if (!church) return [];
    return this.repo.findAllByChurchId(church.id);
  }
}

@Injectable()
export class OnchurchCreateMyWorshipServiceUseCase {
  constructor(
    @Inject(ONCHURCH_WORSHIP_SERVICE_REPOSITORY) private readonly repo: IOnchurchWorshipServiceRepository,
    private readonly managerResolver: OnchurchChurchManagerResolver,
  ) {}
  async execute(userId: number, command: OnchurchWorshipServiceWriteCommand): Promise<OnchurchWorshipService> {
    const church = await this.managerResolver.resolveManagedChurch(userId);
    if (!church) throw new OnchurchWorshipChurchNotConfigured();
    return this.repo.create(church.id, command);
  }
}

@Injectable()
export class OnchurchUpdateMyWorshipServiceUseCase {
  constructor(
    @Inject(ONCHURCH_WORSHIP_SERVICE_REPOSITORY) private readonly repo: IOnchurchWorshipServiceRepository,
    private readonly managerResolver: OnchurchChurchManagerResolver,
    private readonly requiredService: OnchurchChurchRequiredService,
  ) {}
  async execute(userId: number, id: number, command: OnchurchWorshipServiceWriteCommand): Promise<OnchurchWorshipService> {
    const church = await this.managerResolver.resolveManagedChurch(userId);
    if (!church) throw new OnchurchWorshipChurchNotConfigured();
    const owned = await this.repo.findOwnedById(church.id, id);
    if (!owned) throw new OnchurchWorshipServiceNotFound();
    const updated = await this.repo.update(church.id, id, command);
    await this.requiredService.autoUnpublishIfMissing(church);
    return updated;
  }
}

@Injectable()
export class OnchurchDeleteMyWorshipServiceUseCase {
  constructor(
    @Inject(ONCHURCH_WORSHIP_SERVICE_REPOSITORY) private readonly repo: IOnchurchWorshipServiceRepository,
    @Inject(ONCHURCH_ATTENDANCE_REPOSITORY) private readonly attendanceRepo: IOnchurchAttendanceRepository,
    private readonly managerResolver: OnchurchChurchManagerResolver,
    private readonly requiredService: OnchurchChurchRequiredService,
  ) {}
  async execute(userId: number, id: number): Promise<void> {
    const church = await this.managerResolver.resolveManagedChurch(userId);
    if (!church) throw new OnchurchWorshipChurchNotConfigured();
    const owned = await this.repo.findOwnedById(church.id, id);
    if (!owned) throw new OnchurchWorshipServiceNotFound();
    await this.repo.remove(church.id, id);
    // 예배와 연결된(같은 예배 이름) 성도 출석 기록도 함께 soft delete.
    await this.attendanceRepo.softRemoveByServiceType(church.id, owned.name);
    await this.requiredService.autoUnpublishIfMissing(church);
  }
}
