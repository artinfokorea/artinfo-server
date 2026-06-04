import { Inject, Injectable } from '@nestjs/common';
import {
  ONCHURCH_COMMUNITY_CATEGORY_REPOSITORY,
  IOnchurchCommunityCategoryRepository,
} from '@/onchurch/community/domain/repository/onchurch-community-category.repository.interface';
import { ONCHURCH_CHURCH_REPOSITORY, IOnchurchChurchRepository } from '@/onchurch/church/domain/repository/onchurch-church.repository.interface';
import { OnchurchCommunityCategory } from '@/onchurch/community/domain/entity/onchurch-community-category.entity';
import { OnchurchCommunityCategoryWriteCommand } from '@/onchurch/community/application/command/onchurch-community-category-write.command';
import { OnchurchCommunityChurchNotConfigured, OnchurchCommunityCategoryNotFound } from '@/onchurch/community/domain/exception/onchurch-community.exception';

@Injectable()
export class OnchurchListMyCommunityCategoriesUseCase {
  constructor(
    @Inject(ONCHURCH_COMMUNITY_CATEGORY_REPOSITORY) private readonly repo: IOnchurchCommunityCategoryRepository,
    @Inject(ONCHURCH_CHURCH_REPOSITORY) private readonly churchRepo: IOnchurchChurchRepository,
  ) {}
  async execute(userId: number): Promise<OnchurchCommunityCategory[]> {
    const church = await this.churchRepo.findByOwnerId(userId);
    if (!church) return [];
    return this.repo.findAllByChurchId(church.id);
  }
}

@Injectable()
export class OnchurchListPublicCommunityCategoriesUseCase {
  constructor(
    @Inject(ONCHURCH_COMMUNITY_CATEGORY_REPOSITORY) private readonly repo: IOnchurchCommunityCategoryRepository,
    @Inject(ONCHURCH_CHURCH_REPOSITORY) private readonly churchRepo: IOnchurchChurchRepository,
  ) {}
  async execute(slug: string): Promise<OnchurchCommunityCategory[]> {
    const church = await this.churchRepo.findBySlug(slug);
    if (!church) return [];
    return this.repo.findActiveByChurchId(church.id);
  }
}

@Injectable()
export class OnchurchCreateMyCommunityCategoryUseCase {
  constructor(
    @Inject(ONCHURCH_COMMUNITY_CATEGORY_REPOSITORY) private readonly repo: IOnchurchCommunityCategoryRepository,
    @Inject(ONCHURCH_CHURCH_REPOSITORY) private readonly churchRepo: IOnchurchChurchRepository,
  ) {}
  async execute(userId: number, command: OnchurchCommunityCategoryWriteCommand): Promise<OnchurchCommunityCategory> {
    const church = await this.churchRepo.findByOwnerId(userId);
    if (!church) throw new OnchurchCommunityChurchNotConfigured();
    return this.repo.create(church.id, command);
  }
}

@Injectable()
export class OnchurchUpdateMyCommunityCategoryUseCase {
  constructor(
    @Inject(ONCHURCH_COMMUNITY_CATEGORY_REPOSITORY) private readonly repo: IOnchurchCommunityCategoryRepository,
    @Inject(ONCHURCH_CHURCH_REPOSITORY) private readonly churchRepo: IOnchurchChurchRepository,
  ) {}
  async execute(userId: number, id: number, command: OnchurchCommunityCategoryWriteCommand): Promise<OnchurchCommunityCategory> {
    const church = await this.churchRepo.findByOwnerId(userId);
    if (!church) throw new OnchurchCommunityChurchNotConfigured();
    const owned = await this.repo.findOwnedById(church.id, id);
    if (!owned) throw new OnchurchCommunityCategoryNotFound();
    return this.repo.update(church.id, id, command);
  }
}

@Injectable()
export class OnchurchDeleteMyCommunityCategoryUseCase {
  constructor(
    @Inject(ONCHURCH_COMMUNITY_CATEGORY_REPOSITORY) private readonly repo: IOnchurchCommunityCategoryRepository,
    @Inject(ONCHURCH_CHURCH_REPOSITORY) private readonly churchRepo: IOnchurchChurchRepository,
  ) {}
  async execute(userId: number, id: number): Promise<void> {
    const church = await this.churchRepo.findByOwnerId(userId);
    if (!church) throw new OnchurchCommunityChurchNotConfigured();
    const owned = await this.repo.findOwnedById(church.id, id);
    if (!owned) throw new OnchurchCommunityCategoryNotFound();
    await this.repo.remove(church.id, id);
  }
}
