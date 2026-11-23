import { Inject, Injectable } from '@nestjs/common';
import { ONCHURCH_SERMON_REPOSITORY, IOnchurchSermonRepository } from '@/onchurch/sermon/domain/repository/onchurch-sermon.repository.interface';
import { OnchurchChurchManagerResolver } from '@/onchurch/church/application/service/onchurch-church-manager.resolver';
import { OnchurchSermon } from '@/onchurch/sermon/domain/entity/onchurch-sermon.entity';
import { OnchurchSermonWriteCommand } from '@/onchurch/sermon/application/command/onchurch-sermon-write.command';
import { OnchurchSermonChurchNotConfigured, OnchurchSermonNotFound } from '@/onchurch/sermon/domain/exception/onchurch-sermon.exception';
import { OnchurchPushService } from '@/onchurch/push/onchurch-push.service';

@Injectable()
export class OnchurchListMySermonsUseCase {
  constructor(
    @Inject(ONCHURCH_SERMON_REPOSITORY) private readonly repo: IOnchurchSermonRepository,
    private readonly managerResolver: OnchurchChurchManagerResolver,
  ) {}
  async execute(userId: number): Promise<OnchurchSermon[]> {
    const church = await this.managerResolver.resolveManagedChurch(userId);
    if (!church) return [];
    return this.repo.findAllByChurchId(church.id);
  }
}

@Injectable()
export class OnchurchCreateMySermonUseCase {
  constructor(
    @Inject(ONCHURCH_SERMON_REPOSITORY) private readonly repo: IOnchurchSermonRepository,
    private readonly managerResolver: OnchurchChurchManagerResolver,
    private readonly push: OnchurchPushService,
  ) {}
  async execute(userId: number, command: OnchurchSermonWriteCommand): Promise<OnchurchSermon> {
    const church = await this.managerResolver.resolveManagedChurch(userId);
    if (!church) throw new OnchurchSermonChurchNotConfigured();
    const created = await this.repo.create(church.id, command);
    // 교회 사람들에게 앱 알림 — 응답을 기다리게 하지 않는다 (발송 실패는 서비스가 삼킨다)
    void this.push.notifyChurchPost({ churchId: church.id, authorId: userId, kind: 'sermon', title: created.title, isActive: created.isActive });
    return created;
  }
}

@Injectable()
export class OnchurchUpdateMySermonUseCase {
  constructor(
    @Inject(ONCHURCH_SERMON_REPOSITORY) private readonly repo: IOnchurchSermonRepository,
    private readonly managerResolver: OnchurchChurchManagerResolver,
  ) {}
  async execute(userId: number, id: number, command: OnchurchSermonWriteCommand): Promise<OnchurchSermon> {
    const church = await this.managerResolver.resolveManagedChurch(userId);
    if (!church) throw new OnchurchSermonChurchNotConfigured();
    const owned = await this.repo.findOwnedById(church.id, id);
    if (!owned) throw new OnchurchSermonNotFound();
    return this.repo.update(church.id, id, command);
  }
}

@Injectable()
export class OnchurchDeleteMySermonUseCase {
  constructor(
    @Inject(ONCHURCH_SERMON_REPOSITORY) private readonly repo: IOnchurchSermonRepository,
    private readonly managerResolver: OnchurchChurchManagerResolver,
  ) {}
  async execute(userId: number, id: number): Promise<void> {
    const church = await this.managerResolver.resolveManagedChurch(userId);
    if (!church) throw new OnchurchSermonChurchNotConfigured();
    const owned = await this.repo.findOwnedById(church.id, id);
    if (!owned) throw new OnchurchSermonNotFound();
    await this.repo.remove(church.id, id);
  }
}
