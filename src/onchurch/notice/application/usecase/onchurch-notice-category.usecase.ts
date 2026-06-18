import { Inject, Injectable } from '@nestjs/common';
import {
  ONCHURCH_NOTICE_CATEGORY_REPOSITORY,
  IOnchurchNoticeCategoryRepository,
} from '@/onchurch/notice/domain/repository/onchurch-notice-category.repository.interface';
import { ONCHURCH_CHURCH_REPOSITORY, IOnchurchChurchRepository } from '@/onchurch/church/domain/repository/onchurch-church.repository.interface';
import { OnchurchChurchManagerResolver } from '@/onchurch/church/application/service/onchurch-church-manager.resolver';
import { OnchurchNoticeCategory } from '@/onchurch/notice/domain/entity/onchurch-notice-category.entity';
import { OnchurchNoticeCategoryWriteCommand } from '@/onchurch/notice/application/command/onchurch-notice-category-write.command';
import { OnchurchNoticeChurchNotConfigured, OnchurchNoticeCategoryNotFound } from '@/onchurch/notice/domain/exception/onchurch-notice.exception';

@Injectable()
export class OnchurchListMyNoticeCategoriesUseCase {
  constructor(
    @Inject(ONCHURCH_NOTICE_CATEGORY_REPOSITORY) private readonly repo: IOnchurchNoticeCategoryRepository,
    private readonly managerResolver: OnchurchChurchManagerResolver,
  ) {}
  async execute(userId: number): Promise<OnchurchNoticeCategory[]> {
    const church = await this.managerResolver.resolveManagedChurch(userId);
    if (!church) return [];
    // 카테고리를 처음 열 때 '전체' 보기 카테고리를 자동 생성한다(이미 삭제했다면 재생성하지 않음).
    await this.repo.ensureAllCategory(church.id);
    return this.repo.findAllByChurchId(church.id);
  }
}

@Injectable()
export class OnchurchRestoreMyNoticeAllCategoryUseCase {
  constructor(
    @Inject(ONCHURCH_NOTICE_CATEGORY_REPOSITORY) private readonly repo: IOnchurchNoticeCategoryRepository,
    private readonly managerResolver: OnchurchChurchManagerResolver,
  ) {}
  async execute(userId: number): Promise<OnchurchNoticeCategory[]> {
    const church = await this.managerResolver.resolveManagedChurch(userId);
    if (!church) throw new OnchurchNoticeChurchNotConfigured();
    await this.repo.restoreAllCategory(church.id);
    return this.repo.findAllByChurchId(church.id);
  }
}

@Injectable()
export class OnchurchListPublicNoticeCategoriesUseCase {
  constructor(
    @Inject(ONCHURCH_NOTICE_CATEGORY_REPOSITORY) private readonly repo: IOnchurchNoticeCategoryRepository,
    @Inject(ONCHURCH_CHURCH_REPOSITORY) private readonly churchRepo: IOnchurchChurchRepository,
  ) {}
  async execute(slug: string): Promise<OnchurchNoticeCategory[]> {
    const church = await this.churchRepo.findBySlug(slug);
    if (!church) return [];
    return this.repo.findActiveByChurchId(church.id);
  }
}

@Injectable()
export class OnchurchCreateMyNoticeCategoryUseCase {
  constructor(
    @Inject(ONCHURCH_NOTICE_CATEGORY_REPOSITORY) private readonly repo: IOnchurchNoticeCategoryRepository,
    private readonly managerResolver: OnchurchChurchManagerResolver,
  ) {}
  async execute(userId: number, command: OnchurchNoticeCategoryWriteCommand): Promise<OnchurchNoticeCategory> {
    const church = await this.managerResolver.resolveManagedChurch(userId);
    if (!church) throw new OnchurchNoticeChurchNotConfigured();
    return this.repo.create(church.id, command);
  }
}

@Injectable()
export class OnchurchUpdateMyNoticeCategoryUseCase {
  constructor(
    @Inject(ONCHURCH_NOTICE_CATEGORY_REPOSITORY) private readonly repo: IOnchurchNoticeCategoryRepository,
    private readonly managerResolver: OnchurchChurchManagerResolver,
  ) {}
  async execute(userId: number, id: number, command: OnchurchNoticeCategoryWriteCommand): Promise<OnchurchNoticeCategory> {
    const church = await this.managerResolver.resolveManagedChurch(userId);
    if (!church) throw new OnchurchNoticeChurchNotConfigured();
    const owned = await this.repo.findOwnedById(church.id, id);
    if (!owned) throw new OnchurchNoticeCategoryNotFound();
    return this.repo.update(church.id, id, command);
  }
}

@Injectable()
export class OnchurchDeleteMyNoticeCategoryUseCase {
  constructor(
    @Inject(ONCHURCH_NOTICE_CATEGORY_REPOSITORY) private readonly repo: IOnchurchNoticeCategoryRepository,
    private readonly managerResolver: OnchurchChurchManagerResolver,
  ) {}
  async execute(userId: number, id: number): Promise<void> {
    const church = await this.managerResolver.resolveManagedChurch(userId);
    if (!church) throw new OnchurchNoticeChurchNotConfigured();
    const owned = await this.repo.findOwnedById(church.id, id);
    if (!owned) throw new OnchurchNoticeCategoryNotFound();
    await this.repo.remove(church.id, id);
  }
}
