import { Inject, Injectable } from '@nestjs/common';
import {
  ONCHURCH_SAINT_TAG_REPOSITORY,
  IOnchurchSaintTagRepository,
} from '@/onchurch/saint/domain/repository/onchurch-saint-tag.repository.interface';
import {
  ONCHURCH_SAINT_TAG_LINK_REPOSITORY,
  IOnchurchSaintTagLinkRepository,
} from '@/onchurch/saint/domain/repository/onchurch-saint-tag-link.repository.interface';
import {
  ONCHURCH_SAINT_REPOSITORY,
  IOnchurchSaintRepository,
} from '@/onchurch/saint/domain/repository/onchurch-saint.repository.interface';
import { OnchurchChurchManagerResolver } from '@/onchurch/church/application/service/onchurch-church-manager.resolver';
import { OnchurchSaintTag } from '@/onchurch/saint/domain/entity/onchurch-saint-tag.entity';
import {
  OnchurchSaintChurchNotConfigured,
  OnchurchSaintNotFound,
  OnchurchSaintTagDuplicated,
  OnchurchSaintTagNotFound,
} from '@/onchurch/saint/domain/exception/onchurch-saint.exception';

// 교회가 한 번도 태그를 만든 적이 없을 때 자동으로 채워주는 기본 성도 태그.
export const DEFAULT_SAINT_TAGS = ['청년부', '여전도회', '남전도회'];

@Injectable()
export class OnchurchListMySaintTagsUseCase {
  constructor(
    @Inject(ONCHURCH_SAINT_TAG_REPOSITORY) private readonly repo: IOnchurchSaintTagRepository,
    private readonly managerResolver: OnchurchChurchManagerResolver,
  ) {}
  async execute(userId: number): Promise<OnchurchSaintTag[]> {
    const church = await this.managerResolver.resolveManagedChurch(userId);
    if (!church) return [];
    const total = await this.repo.countAllIncludingDeleted(church.id);
    if (total === 0) {
      return this.repo.createMany(church.id, DEFAULT_SAINT_TAGS);
    }
    return this.repo.findAllByChurchId(church.id);
  }
}

@Injectable()
export class OnchurchCreateMySaintTagUseCase {
  constructor(
    @Inject(ONCHURCH_SAINT_TAG_REPOSITORY) private readonly repo: IOnchurchSaintTagRepository,
    private readonly managerResolver: OnchurchChurchManagerResolver,
  ) {}
  async execute(userId: number, name: string): Promise<OnchurchSaintTag> {
    const church = await this.managerResolver.resolveManagedChurch(userId);
    if (!church) throw new OnchurchSaintChurchNotConfigured();
    const existing = await this.repo.findByName(church.id, name);
    if (existing) throw new OnchurchSaintTagDuplicated();
    const all = await this.repo.findAllByChurchId(church.id);
    const nextOrder = all.reduce((max, t) => Math.max(max, t.sortOrder), -1) + 1;
    return this.repo.create(church.id, name, nextOrder);
  }
}

@Injectable()
export class OnchurchDeleteMySaintTagUseCase {
  constructor(
    @Inject(ONCHURCH_SAINT_TAG_REPOSITORY) private readonly repo: IOnchurchSaintTagRepository,
    @Inject(ONCHURCH_SAINT_TAG_LINK_REPOSITORY) private readonly linkRepo: IOnchurchSaintTagLinkRepository,
    private readonly managerResolver: OnchurchChurchManagerResolver,
  ) {}
  async execute(userId: number, id: number): Promise<void> {
    const church = await this.managerResolver.resolveManagedChurch(userId);
    if (!church) throw new OnchurchSaintChurchNotConfigured();
    const owned = await this.repo.findOwnedById(church.id, id);
    if (!owned) throw new OnchurchSaintTagNotFound();
    // 태그를 삭제하면 그 태그가 걸린 모든 성도 연결도 함께 제거한다.
    await this.linkRepo.removeByTagId(church.id, id);
    await this.repo.remove(church.id, id);
  }
}

@Injectable()
export class OnchurchSetMySaintTagsUseCase {
  constructor(
    @Inject(ONCHURCH_SAINT_TAG_REPOSITORY) private readonly tagRepo: IOnchurchSaintTagRepository,
    @Inject(ONCHURCH_SAINT_TAG_LINK_REPOSITORY) private readonly linkRepo: IOnchurchSaintTagLinkRepository,
    @Inject(ONCHURCH_SAINT_REPOSITORY) private readonly saintRepo: IOnchurchSaintRepository,
    private readonly managerResolver: OnchurchChurchManagerResolver,
  ) {}
  async execute(userId: number, saintId: number, tagIds: number[]): Promise<void> {
    const church = await this.managerResolver.resolveManagedChurch(userId);
    if (!church) throw new OnchurchSaintChurchNotConfigured();
    const owned = await this.saintRepo.findOwnedById(church.id, saintId);
    if (!owned) throw new OnchurchSaintNotFound();
    // 우리 교회 태그만 허용(존재하는 것만 반영).
    const uniqueIds = Array.from(new Set(tagIds));
    const validTags = await this.tagRepo.findByIds(church.id, uniqueIds);
    await this.linkRepo.replaceForSaint(church.id, saintId, validTags.map((t) => t.id));
  }
}
