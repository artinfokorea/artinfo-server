import { Inject, Injectable } from '@nestjs/common';
import {
  ONCHURCH_VISITATION_TYPE_REPOSITORY,
  IOnchurchVisitationTypeRepository,
} from '@/onchurch/visitation/domain/repository/onchurch-visitation-type.repository.interface';
import { OnchurchChurchManagerResolver } from '@/onchurch/church/application/service/onchurch-church-manager.resolver';
import { OnchurchVisitationType } from '@/onchurch/visitation/domain/entity/onchurch-visitation-type.entity';
import {
  OnchurchVisitationChurchNotConfigured,
  OnchurchVisitationTypeDuplicated,
  OnchurchVisitationTypeNotFound,
} from '@/onchurch/visitation/domain/exception/onchurch-visitation.exception';

// 교회가 한 번도 종류를 만든 적이 없을 때 자동으로 채워주는 기본 심방 종류.
export const DEFAULT_VISITATION_TYPES = ['대심방', '일반심방', '전화심방', '기타심방'];

@Injectable()
export class OnchurchListMyVisitationTypesUseCase {
  constructor(
    @Inject(ONCHURCH_VISITATION_TYPE_REPOSITORY) private readonly repo: IOnchurchVisitationTypeRepository,
    private readonly managerResolver: OnchurchChurchManagerResolver,
  ) {}
  async execute(userId: number): Promise<OnchurchVisitationType[]> {
    const church = await this.managerResolver.resolveManagedChurch(userId);
    if (!church) return [];
    // 소프트 삭제분까지 0건이면(=한 번도 설정한 적 없음) 기본 종류를 자동 시드한다.
    const total = await this.repo.countAllIncludingDeleted(church.id);
    if (total === 0) {
      return this.repo.createMany(church.id, DEFAULT_VISITATION_TYPES);
    }
    return this.repo.findAllByChurchId(church.id);
  }
}

@Injectable()
export class OnchurchCreateMyVisitationTypeUseCase {
  constructor(
    @Inject(ONCHURCH_VISITATION_TYPE_REPOSITORY) private readonly repo: IOnchurchVisitationTypeRepository,
    private readonly managerResolver: OnchurchChurchManagerResolver,
  ) {}
  async execute(userId: number, name: string): Promise<OnchurchVisitationType> {
    const church = await this.managerResolver.resolveManagedChurch(userId);
    if (!church) throw new OnchurchVisitationChurchNotConfigured();
    const existing = await this.repo.findByName(church.id, name);
    if (existing) throw new OnchurchVisitationTypeDuplicated();
    const all = await this.repo.findAllByChurchId(church.id);
    const nextOrder = all.reduce((max, t) => Math.max(max, t.sortOrder), -1) + 1;
    return this.repo.create(church.id, name, nextOrder);
  }
}

@Injectable()
export class OnchurchDeleteMyVisitationTypeUseCase {
  constructor(
    @Inject(ONCHURCH_VISITATION_TYPE_REPOSITORY) private readonly repo: IOnchurchVisitationTypeRepository,
    private readonly managerResolver: OnchurchChurchManagerResolver,
  ) {}
  async execute(userId: number, id: number): Promise<void> {
    const church = await this.managerResolver.resolveManagedChurch(userId);
    if (!church) throw new OnchurchVisitationChurchNotConfigured();
    const owned = await this.repo.findOwnedById(church.id, id);
    if (!owned) throw new OnchurchVisitationTypeNotFound();
    await this.repo.remove(church.id, id);
  }
}
