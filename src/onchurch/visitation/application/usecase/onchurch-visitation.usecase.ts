import { Inject, Injectable } from '@nestjs/common';
import {
  ONCHURCH_VISITATION_REPOSITORY,
  IOnchurchVisitationRepository,
} from '@/onchurch/visitation/domain/repository/onchurch-visitation.repository.interface';
import { OnchurchChurchManagerResolver } from '@/onchurch/church/application/service/onchurch-church-manager.resolver';
import { OnchurchVisitation } from '@/onchurch/visitation/domain/entity/onchurch-visitation.entity';
import { OnchurchVisitationWriteCommand } from '@/onchurch/visitation/application/command/onchurch-visitation-write.command';
import {
  OnchurchVisitationChurchNotConfigured,
  OnchurchVisitationNotFound,
} from '@/onchurch/visitation/domain/exception/onchurch-visitation.exception';

@Injectable()
export class OnchurchListMyVisitationsUseCase {
  constructor(
    @Inject(ONCHURCH_VISITATION_REPOSITORY) private readonly repo: IOnchurchVisitationRepository,
    private readonly managerResolver: OnchurchChurchManagerResolver,
  ) {}
  async execute(userId: number): Promise<OnchurchVisitation[]> {
    const church = await this.managerResolver.resolveManagedChurch(userId);
    if (!church) return [];
    return this.repo.findAllByChurchId(church.id);
  }
}

@Injectable()
export class OnchurchCreateMyVisitationUseCase {
  constructor(
    @Inject(ONCHURCH_VISITATION_REPOSITORY) private readonly repo: IOnchurchVisitationRepository,
    private readonly managerResolver: OnchurchChurchManagerResolver,
  ) {}
  async execute(userId: number, command: OnchurchVisitationWriteCommand): Promise<OnchurchVisitation> {
    const church = await this.managerResolver.resolveManagedChurch(userId);
    if (!church) throw new OnchurchVisitationChurchNotConfigured();
    return this.repo.create(church.id, command);
  }
}

@Injectable()
export class OnchurchUpdateMyVisitationUseCase {
  constructor(
    @Inject(ONCHURCH_VISITATION_REPOSITORY) private readonly repo: IOnchurchVisitationRepository,
    private readonly managerResolver: OnchurchChurchManagerResolver,
  ) {}
  async execute(userId: number, id: number, command: OnchurchVisitationWriteCommand): Promise<OnchurchVisitation> {
    const church = await this.managerResolver.resolveManagedChurch(userId);
    if (!church) throw new OnchurchVisitationChurchNotConfigured();
    const owned = await this.repo.findOwnedById(church.id, id);
    if (!owned) throw new OnchurchVisitationNotFound();
    return this.repo.update(church.id, id, command);
  }
}

@Injectable()
export class OnchurchDeleteMyVisitationUseCase {
  constructor(
    @Inject(ONCHURCH_VISITATION_REPOSITORY) private readonly repo: IOnchurchVisitationRepository,
    private readonly managerResolver: OnchurchChurchManagerResolver,
  ) {}
  async execute(userId: number, id: number): Promise<void> {
    const church = await this.managerResolver.resolveManagedChurch(userId);
    if (!church) throw new OnchurchVisitationChurchNotConfigured();
    const owned = await this.repo.findOwnedById(church.id, id);
    if (!owned) throw new OnchurchVisitationNotFound();
    await this.repo.remove(church.id, id);
  }
}
