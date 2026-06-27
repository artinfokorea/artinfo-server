import { Inject, Injectable } from '@nestjs/common';
import {
  ONCHURCH_SAINT_REPOSITORY,
  IOnchurchSaintRepository,
} from '@/onchurch/saint/domain/repository/onchurch-saint.repository.interface';
import {
  ONCHURCH_SAINT_RELATION_REPOSITORY,
  IOnchurchSaintRelationRepository,
} from '@/onchurch/saint/domain/repository/onchurch-saint-relation.repository.interface';
import {
  ONCHURCH_SAINT_PRAYER_REPOSITORY,
  IOnchurchSaintPrayerRepository,
} from '@/onchurch/saint/domain/repository/onchurch-saint-prayer.repository.interface';
import {
  ONCHURCH_SAINT_TAG_REPOSITORY,
  IOnchurchSaintTagRepository,
} from '@/onchurch/saint/domain/repository/onchurch-saint-tag.repository.interface';
import {
  ONCHURCH_SAINT_TAG_LINK_REPOSITORY,
  IOnchurchSaintTagLinkRepository,
} from '@/onchurch/saint/domain/repository/onchurch-saint-tag-link.repository.interface';
import { OnchurchChurchManagerResolver } from '@/onchurch/church/application/service/onchurch-church-manager.resolver';
import { OnchurchSaint } from '@/onchurch/saint/domain/entity/onchurch-saint.entity';
import { OnchurchSaintTag } from '@/onchurch/saint/domain/entity/onchurch-saint-tag.entity';
import { OnchurchSaintWriteCommand } from '@/onchurch/saint/application/command/onchurch-saint-write.command';
import {
  OnchurchSaintChurchNotConfigured,
  OnchurchSaintNotFound,
} from '@/onchurch/saint/domain/exception/onchurch-saint.exception';

export interface OnchurchSaintWithTags {
  saint: OnchurchSaint;
  tags: OnchurchSaintTag[];
}

@Injectable()
export class OnchurchListMySaintsUseCase {
  constructor(
    @Inject(ONCHURCH_SAINT_REPOSITORY) private readonly repo: IOnchurchSaintRepository,
    @Inject(ONCHURCH_SAINT_TAG_REPOSITORY) private readonly tagRepo: IOnchurchSaintTagRepository,
    @Inject(ONCHURCH_SAINT_TAG_LINK_REPOSITORY) private readonly linkRepo: IOnchurchSaintTagLinkRepository,
    private readonly managerResolver: OnchurchChurchManagerResolver,
  ) {}
  async execute(userId: number): Promise<OnchurchSaintWithTags[]> {
    const church = await this.managerResolver.resolveManagedChurch(userId);
    if (!church) return [];
    const [saints, tags, links] = await Promise.all([
      this.repo.findAllByChurchId(church.id),
      this.tagRepo.findAllByChurchId(church.id),
      this.linkRepo.findByChurchId(church.id),
    ]);
    const tagById = new Map(tags.map((t) => [t.id, t]));
    const tagsBySaint = new Map<number, OnchurchSaintTag[]>();
    for (const link of links) {
      const tag = tagById.get(link.tagId);
      if (!tag) continue;
      const arr = tagsBySaint.get(link.saintId) ?? [];
      arr.push(tag);
      tagsBySaint.set(link.saintId, arr);
    }
    return saints.map((saint) => ({ saint, tags: tagsBySaint.get(saint.id) ?? [] }));
  }
}

@Injectable()
export class OnchurchCreateMySaintUseCase {
  constructor(
    @Inject(ONCHURCH_SAINT_REPOSITORY) private readonly repo: IOnchurchSaintRepository,
    private readonly managerResolver: OnchurchChurchManagerResolver,
  ) {}
  async execute(userId: number, command: OnchurchSaintWriteCommand): Promise<OnchurchSaint> {
    const church = await this.managerResolver.resolveManagedChurch(userId);
    if (!church) throw new OnchurchSaintChurchNotConfigured();
    return this.repo.create(church.id, command);
  }
}

@Injectable()
export class OnchurchUpdateMySaintUseCase {
  constructor(
    @Inject(ONCHURCH_SAINT_REPOSITORY) private readonly repo: IOnchurchSaintRepository,
    private readonly managerResolver: OnchurchChurchManagerResolver,
  ) {}
  async execute(userId: number, id: number, command: OnchurchSaintWriteCommand): Promise<OnchurchSaint> {
    const church = await this.managerResolver.resolveManagedChurch(userId);
    if (!church) throw new OnchurchSaintChurchNotConfigured();
    const owned = await this.repo.findOwnedById(church.id, id);
    if (!owned) throw new OnchurchSaintNotFound();
    return this.repo.update(church.id, id, command);
  }
}

@Injectable()
export class OnchurchUpdateMySaintMemoUseCase {
  constructor(
    @Inject(ONCHURCH_SAINT_REPOSITORY) private readonly repo: IOnchurchSaintRepository,
    private readonly managerResolver: OnchurchChurchManagerResolver,
  ) {}
  async execute(userId: number, id: number, memo: string | null): Promise<OnchurchSaint> {
    const church = await this.managerResolver.resolveManagedChurch(userId);
    if (!church) throw new OnchurchSaintChurchNotConfigured();
    const owned = await this.repo.findOwnedById(church.id, id);
    if (!owned) throw new OnchurchSaintNotFound();
    return this.repo.updateMemo(church.id, id, memo);
  }
}

@Injectable()
export class OnchurchUpdateMySaintFavoriteUseCase {
  constructor(
    @Inject(ONCHURCH_SAINT_REPOSITORY) private readonly repo: IOnchurchSaintRepository,
    private readonly managerResolver: OnchurchChurchManagerResolver,
  ) {}
  async execute(userId: number, id: number, isFavorite: boolean): Promise<OnchurchSaint> {
    const church = await this.managerResolver.resolveManagedChurch(userId);
    if (!church) throw new OnchurchSaintChurchNotConfigured();
    const owned = await this.repo.findOwnedById(church.id, id);
    if (!owned) throw new OnchurchSaintNotFound();
    return this.repo.updateFavorite(church.id, id, isFavorite);
  }
}

@Injectable()
export class OnchurchDeleteMySaintUseCase {
  constructor(
    @Inject(ONCHURCH_SAINT_REPOSITORY) private readonly repo: IOnchurchSaintRepository,
    @Inject(ONCHURCH_SAINT_RELATION_REPOSITORY) private readonly relationRepo: IOnchurchSaintRelationRepository,
    @Inject(ONCHURCH_SAINT_PRAYER_REPOSITORY) private readonly prayerRepo: IOnchurchSaintPrayerRepository,
    @Inject(ONCHURCH_SAINT_TAG_LINK_REPOSITORY) private readonly tagLinkRepo: IOnchurchSaintTagLinkRepository,
    private readonly managerResolver: OnchurchChurchManagerResolver,
  ) {}
  async execute(userId: number, id: number): Promise<void> {
    const church = await this.managerResolver.resolveManagedChurch(userId);
    if (!church) throw new OnchurchSaintChurchNotConfigured();
    const owned = await this.repo.findOwnedById(church.id, id);
    if (!owned) throw new OnchurchSaintNotFound();
    // 성도를 삭제하면 그 성도가 얽힌 모든 가족관계·기도목록·태그 연결도 함께 제거한다.
    await this.relationRepo.removeBySaintId(church.id, id);
    await this.prayerRepo.removeBySaintId(church.id, id);
    await this.tagLinkRepo.removeBySaintId(church.id, id);
    await this.repo.remove(church.id, id);
  }
}
